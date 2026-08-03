import { NextResponse } from 'next/server';
import { DirectoryFilterSchema } from '@/lib/validations';
import { searchEducators } from '@/lib/educators/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = DirectoryFilterSchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      expertise: searchParams.get('expertise') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      method: searchParams.get('method') ?? 'all',
      sort: searchParams.get('sort') ?? 'rating',
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '9',
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for directory filters',
          details: parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await searchEducators(parsed.data);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Educators retrieved successfully',
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while searching educators',
      },
      { status: 500 }
    );
  }
}
