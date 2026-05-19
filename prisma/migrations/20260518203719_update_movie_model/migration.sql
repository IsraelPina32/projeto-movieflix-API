/*
  Warnings:

  - You are about to drop the column `imdbRating` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `plot` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Movie` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Movie` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(100)`.
  - You are about to drop the `_GenreToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LanguageToMovie` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GenreToMovie" DROP CONSTRAINT "_GenreToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToMovie" DROP CONSTRAINT "_GenreToMovie_B_fkey";

-- DropForeignKey
ALTER TABLE "_LanguageToMovie" DROP CONSTRAINT "_LanguageToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_LanguageToMovie" DROP CONSTRAINT "_LanguageToMovie_B_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "imdbRating",
DROP COLUMN "plot",
DROP COLUMN "poster",
DROP COLUMN "year",
ADD COLUMN     "genre_id" TEXT,
ADD COLUMN     "language_id" TEXT,
ADD COLUMN     "oscar_count" INTEGER,
ADD COLUMN     "release_data" DATE,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" SET DATA TYPE CHAR(100);

-- DropTable
DROP TABLE "_GenreToMovie";

-- DropTable
DROP TABLE "_LanguageToMovie";

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;
