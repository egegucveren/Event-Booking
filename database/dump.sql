-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: event_booking
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` char(11) NOT NULL,
  `event_id` bigint unsigned NOT NULL,
  `attendee_id` bigint unsigned NOT NULL,
  `seats` int unsigned NOT NULL,
  `total_cents` int unsigned NOT NULL,
  `status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_bookings_event_status` (`event_id`,`status`),
  KEY `idx_bookings_attendee_status` (`attendee_id`,`status`),
  CONSTRAINT `fk_bookings_attendee` FOREIGN KEY (`attendee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (4,'PP-2M8R1L',2,3,10,89000,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(5,'PP-4C6V7B',2,6,7,62300,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(6,'PP-8R2L5S',2,7,5,44500,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(7,'PP-6H1W9Q',3,4,9,28800,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(8,'PP-3N7K5D',3,6,4,12800,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(9,'PP-1F8D4J',4,3,11,57200,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(10,'PP-9L2P6C',4,7,6,31200,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(11,'PP-5T4X8A',5,5,14,106400,'cancelled','2026-05-04 12:32:50','2026-05-04 20:00:22'),(12,'PP-7V1N3M',5,6,8,60800,'confirmed','2026-05-04 12:32:50','2026-05-04 12:32:50'),(13,'PP-1F3B7153',2,5,1,8900,'confirmed','2026-05-05 13:28:50','2026-05-05 13:28:50');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_tickets`
--

DROP TABLE IF EXISTS `contact_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','resolved') NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tickets_status` (`status`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_tickets`
--

LOCK TABLES `contact_tickets` WRITE;
/*!40000 ALTER TABLE `contact_tickets` DISABLE KEYS */;
INSERT INTO `contact_tickets` VALUES (1,'Eyupdzhan dinsever','Eyupcandinsever@gmail.com','asdafasfadsfadgdgagadfgagadgfdsfadsf','resolved','2026-05-05 13:31:34');
/*!40000 ALTER TABLE `contact_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organiser_id` bigint unsigned NOT NULL,
  `title` varchar(160) NOT NULL,
  `category` varchar(80) NOT NULL,
  `venue` varchar(160) NOT NULL,
  `city` varchar(120) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `price_cents` int unsigned NOT NULL,
  `capacity` int unsigned NOT NULL,
  `excerpt` varchar(220) NOT NULL,
  `description` text NOT NULL,
  `status` enum('scheduled','cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_events_organiser` (`organiser_id`),
  KEY `idx_events_start` (`starts_at`),
  CONSTRAINT `fk_events_organiser` FOREIGN KEY (`organiser_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (2,2,'Founders Sprint Workshop','Workshop','Mill Studio','Cork','2026-06-20 10:00:00','2026-06-20 16:00:00',8900,48,'A practical build day for early-stage founders and product teams.','This workshop helps organisers run a premium daytime event with real session planning, downloadable materials, and a paced agenda. Attendees leave with a sharper project brief, clearer priorities, and a stronger network.','scheduled','2026-05-04 12:32:50','2026-05-04 12:32:50'),(3,2,'Sunrise Reset Club','Wellness','Cliff Pavilion','Galway','2026-07-04 07:30:00','2026-07-04 10:30:00',3200,60,'Breathwork, mobility, and a social breakfast by the sea.','Designed for community-focused event brands, this morning format combines movement, guided breathing, and healthy food service in a compact booking flow that is easy for attendees to understand and easy for organisers to manage.','scheduled','2026-05-04 12:32:50','2026-05-04 12:32:50'),(4,2,'Limerick Food Trail','Food','Market Hall','Limerick','2026-07-18 13:00:00','2026-07-18 17:00:00',5200,90,'A guided afternoon of local tastings, chef demos, and small-batch producers.','This food experience brings attendees through a curated tasting route with timed sessions, producer stories, and a relaxed marketplace finish. It is built for simple ticketing, clear capacity planning, and smooth guest flow.','scheduled','2026-05-04 12:32:50','2026-05-04 12:32:50'),(5,2,'Product Leaders Forum','Tech','Docklands Hub','Dublin','2026-08-01 09:30:00','2026-08-01 15:30:00',7600,110,'Talks and roundtables for product, design, and engineering leaders.','A focused conference format with practical sessions, panel discussion, and structured networking. Organisers can highlight agenda depth while attendees get a clear reason to reserve a seat early.','scheduled','2026-05-04 12:32:50','2026-05-04 12:32:50');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `fk_sessions_user` (`user_id`),
  KEY `idx_sessions_token` (`token_hash`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (13,1,'0631adfbd5bcab3bceedf16aad19984f2b796fe9286471234a0c8bbeeb5536a8','2026-05-12 13:29:57','2026-05-05 13:29:57');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','organiser','attendee') NOT NULL,
  `is_owner` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','admin',1,'2026-05-04 12:32:50'),(2,'Maya Quinn','organiser@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','organiser',0,'2026-05-04 12:32:50'),(3,'Leo Hart','attendee@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','attendee',0,'2026-05-04 12:32:50'),(4,'Ava Brooks','ava@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','attendee',0,'2026-05-04 12:32:50'),(5,'Noah Reed','noah@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','attendee',0,'2026-05-04 12:32:50'),(6,'Sofia Lane','sofia@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','attendee',0,'2026-05-04 12:32:50'),(7,'Ethan Stone','ethan@pulsepass.local','33498aca69c152493573bfe8e35a76ff:17e435c238e230603a34e89f4e4e765d74c26465bc0b6270e22c73113dd73916f86dfc8aaa73b1c4f4467de1d7db4665664c39d87a483a5af29013deaa2902df','attendee',0,'2026-05-04 12:32:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 18:05:34
