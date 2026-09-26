ALTER TABLE "Category"
ADD COLUMN "nameAm" TEXT,
ADD COLUMN "nameOr" TEXT;

ALTER TABLE "MenuItem"
ADD COLUMN "nameAm" TEXT,
ADD COLUMN "nameOr" TEXT,
ADD COLUMN "descriptionAm" TEXT,
ADD COLUMN "descriptionOr" TEXT;
