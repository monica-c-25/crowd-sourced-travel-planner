-- Monica Cao, William Chen, Patrick Kim, Sidney Wong
-- CS 492
-- 1.21.2025

SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- -----------------------------------------------------
-- Table `Comments`
-- -----------------------------------------------------

CREATE OR REPLACE TABLE `Comments` (
  `idComments` INT NOT NULL AUTO_INCREMENT,
  `Comment` VARCHAR(120) NOT NULL,
  `idExperiences` INT NOT NULL,
  PRIMARY KEY (`idComments`),
  CONSTRAINT `fk_comment_experience`
    FOREIGN KEY (`idExperiences`)
    REFERENCES `Experiences` (`idExperiences`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)

-- -----------------------------------------------------
-- Table `Experiences`
-- -----------------------------------------------------

CREATE OR REPLACE TABLE `Experiences` (
  `idExperiences` INT NOT NULL AUTO_INCREMENT,
  `NumberComments` INT NOT NULL DEFAULT 0,
  `userRating` DECIMAL(3,2) NOT NULL DEFAULT 0,
  `Description` VARCHAR(1200) NOT NULL,
  `Title` VARCHAR(120) NOT NULL,
  `ExperienceDate` DATE NOT NULL,
  `CreationDate` DATE NOT NULL,
  `idUsers` INT,
  `idPhoto` INT NOT NULL,
  PRIMARY KEY (`idExperiences`),
  CONSTRAINT `fk_experience_user`
    FOREIGN KEY ('idUsers')
    REFERENCES `Users` (`idUsers`)
  CONSTRAINT `fk_experience_photo`
    FOREIGN KEY ('idPhoto')
    REFERENCES `PhotoIds` (`idPhoto`))

-- -----------------------------------------------------
-- Table `PhotoIds`
-- -----------------------------------------------------

CREATE OR REPLACE TABLE `PhotoIds` (
  `idPhoto` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idPhotoIds`))

-- -----------------------------------------------------
-- Table `TripExperienceDetail`
-- -----------------------------------------------------

CREATE OR REPLACE TABLE `TripExperienceDetail` (
  `idExperiences` INT NOT NULL,
  `idTrips` INT NOT NULL,
  CONSTRAINT `fk_TripExperienceDetail_Experiences1`
    FOREIGN KEY (`Experiences_idExperiences`)
    REFERENCES `Experiences` (`idExperiences`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TripExperienceDetail_Trips`
    FOREIGN KEY (`idTrips`)
    REFERENCES `Trips` (`idTrips`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)

-- -----------------------------------------------------
-- Table `Trips`
-- -----------------------------------------------------

CREATE OR REPLACE TABLE `Trips` (
  `idTrips` INT NOT NULL AUTO_INCREMENT,
  `Location` VARCHAR(200) NOT NULL,
  `idUsers` INT NOT NULL,
  PRIMARY KEY (`idTrips`),
  CONSTRAINT `fk_Trips_Users`
    FOREIGN KEY (`idUsers`)
    REFERENCES `Users` (`idUsers`))


-- -----------------------------------------------------
-- Table `Users`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `mydb`.`Users` (
  `idUsers` INT NOT NULL AUTO_INCREMENT,
  `UserName` VARCHAR(45) NOT NULL,
  `PostsMade` INT NOT NULL,
  PRIMARY KEY (`idUsers`),
  UNIQUE INDEX `UserName_UNIQUE` (`UserName` ASC) VISIBLE)