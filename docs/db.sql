-- MySQL Workbench Synchronization
-- Generated: 2025-06-04 11:00
-- Model: New Model
-- Version: 1.0
-- Project: Name of the project
-- Author: seb

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE =
        'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `hplay` DEFAULT CHARACTER SET utf8;

CREATE TABLE IF NOT EXISTS hplay.`medias`
(
    `id`            INT(11)      NULL     DEFAULT NULL AUTO_INCREMENT,
    `name`          VARCHAR(150) NOT NULL,
    `description`   LONGTEXT     NOT NULL,
    `price`         FLOAT(11)    NOT NULL,
    `share_id`      VARCHAR(45)  NULL     DEFAULT NULL,
    `available`     TINYINT(4)   NOT NULL DEFAULT 1,
    `preview`       VARCHAR(256) NULL     DEFAULT NULL,
    `infomaniak_id` VARCHAR(16)  NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
    UNIQUE INDEX `shareId_UNIQUE` (`share_id` ASC) VISIBLE
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`tags`
(
    `id`   INT(11)     NULL DEFAULT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`medias_has_tags`
(
    `media_id` INT(11) NOT NULL,
    `tag_id`   INT(11) NOT NULL,
    INDEX `fk_videos_has_tags_tags1_idx` (`tag_id` ASC) VISIBLE,
    INDEX `fk_videos_has_tags_videos_idx` (`media_id` ASC) VISIBLE,
    INDEX `fk_videos_has_tags_tags1` (`tag_id` ASC) VISIBLE,
    INDEX `fk_videos_has_tags_videos` (`media_id` ASC) VISIBLE,
    CONSTRAINT `fk_videos_has_tags_tags1`
        FOREIGN KEY (`tag_id`)
            REFERENCES `hplay`.`tags` (`id`),
    CONSTRAINT `fk_videos_has_tags_videos`
        FOREIGN KEY (`media_id`)
            REFERENCES `hplay`.`medias` (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`users`
(
    `id`             INT(11)      NULL     DEFAULT NULL AUTO_INCREMENT,
    `email`          VARCHAR(256) NOT NULL,
    `firstname`      VARCHAR(100) NOT NULL,
    `lastname`       VARCHAR(100) NOT NULL,
    `password`       VARCHAR(256) NOT NULL,
    `is_admin`       TINYINT(4)   NOT NULL DEFAULT 0,
    `is_contributor` TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`medias_has_users`
(
    `media_id` INT(11) NOT NULL,
    `user_id`  INT(11) NOT NULL,
    INDEX `fk_videos_has_users_users1_idx` (`user_id` ASC) VISIBLE,
    INDEX `fk_videos_has_users_videos1_idx` (`media_id` ASC) VISIBLE,
    INDEX `fk_videos_has_users_users1` (`user_id` ASC) VISIBLE,
    INDEX `fk_videos_has_users_videos1` (`media_id` ASC) VISIBLE,
    CONSTRAINT `fk_videos_has_users_users1`
        FOREIGN KEY (`user_id`)
            REFERENCES `hplay`.`users` (`id`),
    CONSTRAINT `fk_videos_has_users_videos1`
        FOREIGN KEY (`media_id`)
            REFERENCES `hplay`.`medias` (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`payments`
(
    `id`           INT(11)      NULL     DEFAULT NULL AUTO_INCREMENT,
    `reference_id` VARCHAR(128) NOT NULL,
    `is_paid`      TINYINT(4)   NOT NULL DEFAULT 0,
    `users_id`     INT(11)      NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `reference_id_UNIQUE` (`reference_id` ASC) VISIBLE,
    INDEX `fk_payments_users1_idx` (`users_id` ASC) VISIBLE,
    INDEX `fk_payments_users1` (`users_id` ASC) VISIBLE,
    CONSTRAINT `fk_payments_users1`
        FOREIGN KEY (`users_id`)
            REFERENCES `hplay`.`users` (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `hplay`.`medias_has_payments`
(
    `medias_id`   INT(11) NOT NULL,
    `payments_id` INT(11) NOT NULL,
    INDEX `fk_medias_has_payments_medias1_idx` (`medias_id` ASC) VISIBLE,
    INDEX `fk_medias_has_payments_payments1_idx` (`payments_id` ASC) VISIBLE,
    INDEX `fk_medias_has_payments_medias1` (`medias_id` ASC) VISIBLE,
    INDEX `fk_medias_has_payments_payments1` (`payments_id` ASC) VISIBLE,
    CONSTRAINT `fk_medias_has_payments_medias1`
        FOREIGN KEY (`medias_id`)
            REFERENCES `hplay`.`medias` (`id`),
    CONSTRAINT `fk_medias_has_payments_payments1`
        FOREIGN KEY (`payments_id`)
            REFERENCES `hplay`.`payments` (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
