# SEMESTA ISLAM — API RESOURCE MODEL
**Phase:** P1
**Status:** [REPOSITORY VERIFIED]

This document defines the explicit API resources extracted from the Prisma domain model. It specifies the public identifiers, exposed fields, and allowed operations for each resource that is suitable for the Developer Platform.

---

## 1. Resource: `Educator`
**Purpose:** Represents a verified Islamic educator. This is a read-optimized aggregate resource combining `UserProfile` and `EducatorProfile`.
**Canonical Source:** `users`, `user_profiles`, `educator_profiles`
**Public Identifier:** `id` (maps to `EducatorProfile.id`, UUID)

**Fields:**
- `id` (UUID)
- `fullName` (String)
- `avatarUrl` (String, nullable)
- `bio` (String, nullable)
- `locationCity` (String, nullable)
- `titlePrefix` (String, nullable)
- `titleSuffix` (String, nullable)
- `institutionName` (String, nullable)
- `teachingMethod` (Enum: `ONLINE_ZOOM`, `PRIVATE_HOME`, `GROUP_MAJELIS`)
- `ratingAverage` (Float)
- `reviewsCount` (Int)
- `verifiedStatus` (Enum)

**Restricted / Sensitive Fields:**
- `User.email`, `User.phone` (NEVER exposed to the public)
- `EducatorProfile.userId` (Internal FK, do not expose)

**Relationships:**
- `sanads`: List of `Sanad` resources
- `credentials`: List of `CredentialBadge` resources
- `courses`: List of `Course` resources
- `reviews`: List of `Review` resources

**Allowed Operations:**
- `GET /educators` (Public list with filtering, sorting, pagination)
- `GET /educators/{id}` (Public detail)

**Authorization:** PUBLIC
**Pagination/Filtering:** Paginated limit/offset. Filter by `teachingMethod`, `locationCity`. Sort by `ratingAverage`, `reviewsCount`.

---

## 2. Resource: `Sanad`
**Purpose:** Represents an educator's verified chain of transmission for a specific qiraah or text.
**Canonical Source:** `sanad_records`
**Public Identifier:** `id` (UUID)

**Fields:**
- `id` (UUID)
- `qiraahType` (String)
- `chainDescription` (String)
- `verifiedByLajnah` (Boolean)

**Restricted / Sensitive Fields:**
- `certificateUrl` (May contain PII or sensitive images. Ensure it is either signed/expiring or restricted).

**Allowed Operations:**
- `GET /educators/{educator_id}/sanads`
- `GET /sanads/{id}`

**Authorization:** PUBLIC

---

## 3. Resource: `Course`
**Purpose:** Represents a course or learning program offered by an educator.
**Canonical Source:** `course_catalogs`
**Public Identifier:** `id` (UUID)

**Fields:**
- `id` (UUID)
- `title` (String)
- `category` (String)
- `description` (String)
- `duration` (String)

**Relationships:**
- `schedules`: List of `CourseSchedule` resources (dayOfWeek, startTime, endTime)

**Allowed Operations:**
- `GET /courses` (Public list)
- `GET /educators/{educator_id}/courses`
- `GET /courses/{id}`

**Authorization:** PUBLIC
**Filtering:** Filter by `category`.

---

## 4. Resource: `Booking`
**Purpose:** Represents an intent to learn from an educator.
**Canonical Source:** `booking_requests`
**Public Identifier:** `id` (UUID)

**Fields:**
- `id` (UUID)
- `learningMethod` (Enum)
- `status` (Enum)
- `notes` (String)
- `createdAt` (DateTime)

**Restricted / Sensitive Fields:**
- `learnerUserId` (Internal FK)
- `educatorId` (Internal FK)

**Allowed Operations:**
- `POST /bookings` (Create inquiry)
- `GET /bookings` (List own bookings)
- `GET /bookings/{id}` (Detail)

**Authorization:** AUTHENTICATED (Learner or Educator involved in the booking)
**Events (Webhooks):** `booking.created`, `booking.confirmed`, `booking.cancelled`

---

## 5. Excluded Resources [REJECTED FOR PUBLIC API]

The following entities were evaluated and explicitly **REJECTED** as public API resources to protect privacy and system integrity:

- **`User` / `LearnerProfile`**: Personal contact info and private notes must not be exposed.
- **`VerificationRequest`**: Contains sensitive KTP/Ijazah URLs and hashes. This is strictly a `VERIFIER` boundary (Lajnah dashboard only).
- **`EconomicLedger`**: Strictly internal/private financial data.
- **`AuditLog`**: System logs.
- **`ReferralConversion`**: Private growth metrics.

**Next Step:** Proceed to Phase P2 (JSON Schema Contract) to determine how these explicit resources translate into machine-readable JSON Schema representations.
