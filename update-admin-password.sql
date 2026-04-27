UPDATE users
SET "passwordHash" = '$2b$12$g4WMjLBOru14B0hxWXiTS.r4mJ8rET1GbO/YKaSwFhsCIblfeEnJy',
    role = 'SUPER_ADMIN',
    "isActive" = true,
    "updatedAt" = NOW()
WHERE email = 'arfinnaim02@gmail.com';