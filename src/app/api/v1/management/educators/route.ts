import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { slugify, uniqueSlug } from '@/lib/slugs';
import { LearningMethod, VerificationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const CreateEducatorSchema = z.object({
  email: z.string().email('Email tidak valid').toLowerCase(),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  titlePrefix: z.string().max(50).optional(),
  titleSuffix: z.string().max(120).optional(),
  institutionName: z.string().max(200).optional(),
  locationCity: z.string().max(100).optional(),
  bio: z.string().max(3000).optional(),
  teachingMethod: z.enum(['ONLINE_ZOOM', 'PRIVATE_HOME', 'GROUP_MAJELIS']).default('ONLINE_ZOOM'),
  phone: z.string().max(30).optional(),
  verificationStatus: z
    .enum(['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const)
    .default('SUBMITTED'),
  createVerificationRequest: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    // Founder-only governance mutation (not delegable).
    try {
      await requirePermission({ actor: identity, capability: CAPABILITIES.FOUNDER_MANAGE });
    } catch {
      return NextResponse.json(
        { success: false, statusCode: 403, message: 'Forbidden: only FOUNDER_ADMIN can manage educators.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = CreateEducatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          details: parsed.error.errors.map((err) => ({ field: err.path.join('.'), issue: err.message })),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Idempotent: if the email already maps to an educator profile, refuse
    // duplicates (the founder should edit that profile instead).
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      include: { educator: { select: { id: true } } },
    });
    if (existingUser?.educator) {
      return NextResponse.json(
        { success: false, statusCode: 409, message: 'Akun ini sudah memiliki profil pendidik.' },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Reuse existing user if present (idempotent provisioning), else create.
      const user = existingUser
        ? existingUser
        : await tx.user.create({
            data: {
              email: input.email,
              phone: input.phone ?? null,
              status: 'ACTIVE',
            },
          });

      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName: input.fullName,
          avatarUrl: null,
          locationCity: input.locationCity ?? null,
          bio: input.bio ?? null,
        },
        create: {
          userId: user.id,
          fullName: input.fullName,
          locationCity: input.locationCity ?? null,
          bio: input.bio ?? null,
        },
      });

      await tx.roleAssignment.upsert({
        where: { userId_role: { userId: user.id, role: 'EDUCATOR' } },
        update: {},
        create: { userId: user.id, role: 'EDUCATOR' },
      });

      // Deterministic canonical slug with collision handling.
      const desiredSlug = slugify(input.fullName);
      const taken = await tx.educatorProfile.findMany({
        where: { slug: { startsWith: desiredSlug } },
        select: { slug: true },
      });
      const slug = uniqueSlug(desiredSlug, new Set(taken.map((t) => t.slug!).filter(Boolean)));

      const educator = await tx.educatorProfile.create({
        data: {
          userId: user.id,
          titlePrefix: input.titlePrefix ?? null,
          titleSuffix: input.titleSuffix ?? null,
          institutionName: input.institutionName ?? null,
          teachingMethod: input.teachingMethod as LearningMethod,
          verifiedStatus: input.verificationStatus as VerificationStatus,
          slug,
        },
      });

      if (input.createVerificationRequest && input.verificationStatus === 'SUBMITTED') {
        await tx.verificationRequest.create({
          data: {
            educatorId: educator.id,
            status: 'SUBMITTED',
            reviewNotes: 'Dibuat oleh manajemen melalui panel pendidik.',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: identity.userId,
          actionType: 'EDUCATOR_CREATED',
          entityAffected: 'educator_profiles',
          metadata: {
            entityId: educator.id,
            email: input.email,
            fullName: input.fullName,
            slug,
            verificationStatus: input.verificationStatus,
          },
        },
      });

      return educator;
    });

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: 'Profil pendidik berhasil dibuat.',
        data: { educatorId: result.id, slug: result.slug, email: input.email },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
