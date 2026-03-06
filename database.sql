-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: coffee_shop
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `regular` decimal(5,2) DEFAULT NULL,
  `large` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,'Americano',1.50,2.00),(2,'Latte',2.50,3.00),(3,'Cappuccino',2.50,3.00),(4,'Hot Chocolate',2.00,2.50),(5,'Mocha',2.50,3.00);
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `items` text NOT NULL,
  `pick_up_time` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Accepted',
  `cancel_reason` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'[{\"name\":\"Hot Chocolate\",\"regular\":2,\"large\":2.5,\"size\":\"large\",\"price\":2.5}]','2026-03-04 05:23:00','Cancelled',NULL),(2,'[{\"name\":\"Americano\",\"regular\":1.5,\"large\":2,\"size\":\"regular\",\"price\":1.5}]','2026-03-04 19:57:00','Completed',NULL),(3,'[{\"name\":\"Americano\",\"regular\":1.5,\"large\":2,\"size\":\"regular\",\"price\":1.5},{\"name\":\"Latte\",\"regular\":2.5,\"large\":3,\"size\":\"large\",\"price\":3}]','2026-03-04 07:05:00','Completed',NULL),(4,'[{\"name\":\"Latte\",\"regular\":2.5,\"large\":3,\"size\":\"regular\",\"price\":2.5}]','2026-03-04 16:06:00','Cancelled',NULL),(5,'[{\"name\":\"Americano\",\"regular\":1.5,\"large\":2,\"size\":\"regular\",\"price\":1.5}]','2026-03-02 10:20:00','Cancelled',NULL),(6,'[{\"name\":\"Americano\",\"regular\":1.5,\"large\":2,\"size\":\"regular\",\"price\":1.5}]','2026-03-05 10:42:00','Completed',NULL),(7,'[{\"name\":\"Americano\",\"regular\":1.5,\"large\":2,\"size\":\"regular\",\"price\":1.5},{\"name\":\"Hot Chocolate\",\"regular\":2,\"large\":2.5,\"size\":\"large\",\"price\":2.5}]','2026-03-05 10:35:00','Cancelled',NULL),(8,'[{\"name\":\"Hot Chocolate\",\"regular\":2,\"large\":2.5,\"size\":\"regular\",\"price\":2},{\"name\":\"Hot Chocolate\",\"regular\":2,\"large\":2.5,\"size\":\"large\",\"price\":2.5}]','2026-03-06 12:36:00','Completed',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-06 20:36:53
