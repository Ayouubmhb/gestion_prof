-- DropForeignKey
ALTER TABLE `matieresprofesseurs` DROP FOREIGN KEY `MatieresProfesseurs_professeurId_fkey`;

-- DropForeignKey
ALTER TABLE `professeur` DROP FOREIGN KEY `Professeur_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Professeur` ADD CONSTRAINT `Professeur_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatieresProfesseurs` ADD CONSTRAINT `MatieresProfesseurs_professeurId_fkey` FOREIGN KEY (`professeurId`) REFERENCES `Professeur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
