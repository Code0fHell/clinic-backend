-- drop database clinic_management;

CREATE DATABASE IF NOT EXISTS clinic_management;
USE clinic_management;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` char(36) NOT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `schedule_detail_id` char(36) DEFAULT NULL,
  `appointment_date` datetime DEFAULT NULL,
  `session` enum('MORNING','AFTERNOON') DEFAULT NULL,
  `status` enum('PENDING','DOING','CANCELLED','CHECKED_IN','COMPLETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  KEY `schedule_detail_id` (`schedule_detail_id`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`schedule_detail_id`) REFERENCES `work_schedule_detail` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES ('053db44e-c037-418d-b4b5-c44ba82677ad','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','d590a0fd-94bb-4326-9886-8297178c25f4','2025-11-18 19:12:55','AFTERNOON','COMPLETED','Hô hấp khó khăn','2025-11-19 08:00:00'),('0b1f623d-6b7d-4530-a397-bdd5fa23ad41','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2f007740-3eb5-4ad9-91e8-4d671f5f3c01','953fde4f-5d9d-4973-bab0-f86e09c906a4','2025-10-29 17:38:24','AFTERNOON','CHECKED_IN','Đau ngực 6 ngày','2025-10-30 08:16:00'),('0fc55107-3f6d-4001-bc9d-38cd20f8a6b9','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','18215c77-53fa-48df-82b9-dbf50b616eb7','2025-11-23 06:12:46','AFTERNOON','PENDING','Khó thở tức ngực','2025-11-23 13:15:00'),('14b5adf7-99c4-42b0-886c-1a97e82f2a52','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','05cdc77c-5219-4069-bc34-66fb28cb4705','2025-11-19 07:53:35','AFTERNOON','CHECKED_IN','Tức ngực khó thở','2025-11-19 08:15:00'),('3ac7e1d7-46af-483d-8a14-7ff5a60146ec','3dc435ec-fce1-4874-bb75-fb1218cec5cf','b4c52108-5e14-46ed-8909-d173ab9d1383','c641b2d6-ab7f-4192-880e-240028181452','2025-10-31 03:48:21','AFTERNOON','PENDING','Ho lau ngay','2025-10-31 08:51:00'),('3d4dce6e-1f2d-4911-acaa-bbf97d5fbe7c','3dc435ec-fce1-4874-bb75-fb1218cec5cf','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','8942ca9e-4d76-4af1-a392-e3148b70033a','2025-10-27 17:00:00','AFTERNOON','CHECKED_IN','Tức ngực kéo dài',NULL),('422aa8a0-2b17-49a1-b61a-55823c375cbb','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','d44d3853-0cf1-4355-9503-b7199c1b689d','2025-11-08 16:34:57','MORNING','PENDING','Dau bung','2025-11-08 22:00:00'),('45528c46-2ea8-47e3-954a-7e228d2604fe','3dc435ec-fce1-4874-bb75-fb1218cec5cf','187de741-ddb2-40ac-af5b-fb8394abbc1b','3b262d09-d6ed-4888-bee7-b2b3cffe52f7','2025-10-27 17:00:00','AFTERNOON','PENDING','Tức ngực',NULL),('495fe138-3e8d-437e-94a0-92b444dd0c9c','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','bee941a7-dcdd-4df3-a39d-191711d71b51','2025-11-23 14:00:07','AFTERNOON','PENDING','Tức ngực khó thở','2025-11-23 14:00:00'),('50cd1614-44c0-4bcb-a455-74c4ce01444d','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','92cfa538-2d25-4388-8c41-0e04d5b6e397','2025-11-13 17:51:56','AFTERNOON','CHECKED_IN','Khó thở dài ngày','2025-11-14 08:30:00'),('559c257e-cb3d-4155-8406-960faaff49c1','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','24b5864c-1c85-4e66-9994-598617d0f16d','2025-11-23 14:44:21','AFTERNOON','PENDING','Tức ngực khó thở','2025-11-23 14:45:00'),('5e4f26ac-332c-4a7c-afbf-e4953b2a3273','3dc435ec-fce1-4874-bb75-fb1218cec5cf','187de741-ddb2-40ac-af5b-fb8394abbc1b','8eb2c7d3-1d15-425f-9bcf-c8ec2151cbb6','2025-10-28 08:49:26','AFTERNOON','PENDING','','2025-10-28 08:21:01'),('696eff3a-3cb1-4c3d-8149-12f7330ab553','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','f67494c9-2e28-41cd-82a6-410eeb86c852','2025-11-22 15:25:51','AFTERNOON','COMPLETED','Tức ngực khó thở','2025-11-23 13:00:00'),('7deeae5a-7154-44aa-ba3f-85b3c335c467','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','bf270ba3-9277-474b-8026-600680909a4d','2025-10-31 03:47:09','AFTERNOON','CHECKED_IN','Tuc nguc','2025-10-31 11:41:25'),('7f9ab529-faa1-4e22-b90a-4d41baee2412','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','c08bcdcb-91ee-4938-91c4-23ce2af75684','2025-11-23 14:50:39','AFTERNOON','PENDING','Khó thở dài ngày','2025-11-23 15:00:00'),('8810fbb1-17e2-46c5-a150-089ec0b4ee1c','3dc435ec-fce1-4874-bb75-fb1218cec5cf','187de741-ddb2-40ac-af5b-fb8394abbc1b','704610e4-1a6e-4b9c-b815-2ef948f292ef','2025-10-28 07:57:47','AFTERNOON','PENDING','Khó thở cấp',NULL),('8b330460-bd88-40a7-be76-2792338adf67','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','cf68467a-7542-4027-9d49-eb3179c8db3b','2025-11-23 19:22:35','MORNING','CHECKED_IN','Tuc nguc kho tho','2025-11-24 17:00:00'),('8f19803b-e667-4b87-80fc-d931aadd9353','3dc435ec-fce1-4874-bb75-fb1218cec5cf','28a2b580-e3de-43d0-bc62-677f8803c3cf','86a4f8af-55b6-4995-b02a-085811a26a82','2025-10-28 09:19:16','AFTERNOON','CHECKED_IN','Đau bụng 5 ngày','2025-10-28 16:46:00'),('9250273c-7c94-4860-9fad-7a85fcea3764','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','dace6559-17a4-4bbc-95fd-373ff30d3c8c','2025-11-23 15:39:41','AFTERNOON','PENDING','Khó thở lâu ngày, đau ngực khi ho','2025-11-23 15:15:00'),('925705ad-600a-4893-9c4b-d0eeb306360a','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','85edd9f8-6c85-4d4a-9216-555d4058571c','2025-11-27 09:26:57','MORNING','CHECKED_IN','Kho tho','2025-11-27 17:00:00'),('a327e102-dc82-4626-9877-8e1686c06b78','3dc435ec-fce1-4874-bb75-fb1218cec5cf','28a2b580-e3de-43d0-bc62-677f8803c3cf','a64082c9-162a-4c90-8ba4-7a5522c81a00','2025-10-29 03:23:40','AFTERNOON','CHECKED_IN','Đau bụng lâu ngày','2025-10-29 08:21:01'),('a587877b-2731-4ebb-98cb-dbd9eb2f1e85','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','908681c1-cd97-413b-8e37-a8030c0231fa','2025-12-02 14:09:54','MORNING','PENDING','Tức ngực','2025-12-02 17:00:00'),('ab117576-d824-432a-bfd6-08c2b0210f3c','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','971bd4c3-f00b-4d8b-86d7-67e33ac53ac6','2025-11-11 17:15:38','AFTERNOON','PENDING','Đau bụng','2025-11-12 08:00:00'),('b273ce66-a2cb-416b-8173-fc4931c8a8d3','3dc435ec-fce1-4874-bb75-fb1218cec5cf','6af7d70c-ef46-48fc-87fa-4c540264d405','5a112652-7ff2-4c41-b1a0-4bce00f95d27','2025-10-24 17:00:00','AFTERNOON','CHECKED_IN','Đau ngực',NULL),('b39d958d-3d5b-4474-b8d7-cd6ca70ea65a','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','43b8218c-7550-470e-b0c5-4df6923f73b5','2025-11-28 09:14:48','MORNING','PENDING','Khó thở lâu ngày','2025-11-28 17:00:00'),('ba19cff0-c51a-4cca-8a12-be096a3ffe18','3dc435ec-fce1-4874-bb75-fb1218cec5cf','ff360204-61f9-4df9-9e0a-bf84022799c1','d280b03b-1a68-493e-bf2a-10912a3ebdc4','2025-10-30 20:53:18','AFTERNOON','COMPLETED','Tức ngực khó thở','2025-10-31 08:00:00'),('ca06dbb5-8f7d-4c31-91e1-f29cda134fbc','3dc435ec-fce1-4874-bb75-fb1218cec5cf','a55abefa-31e6-4a60-9d7e-f30867c3662b','f40b3560-518b-4d7a-a5eb-ea8f0e51432c','2025-10-31 03:49:39','AFTERNOON','PENDING','Thinh thoang tuc nguc','2025-10-31 08:41:00'),('cfe535d5-2080-46bf-8314-45dbbd464a84','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','56598be6-58ad-4849-b656-64bc223e210a','2025-11-25 09:49:42','MORNING','PENDING','Khó thở lâu ngày','2025-11-25 17:00:00'),('d3d2b744-2e98-41f6-8d42-4003a73fe209','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','54c9b477-1f54-4dfa-90d5-e8cc5f8da5ae','2025-11-23 14:39:08','AFTERNOON','PENDING','Khó thở ','2025-11-23 14:30:00'),('e4654d01-3fd9-439b-b60d-9d34bcc4dcb2','3dc435ec-fce1-4874-bb75-fb1218cec5cf','187de741-ddb2-40ac-af5b-fb8394abbc1b','2c61510f-b324-40ec-b856-74a65d336044','2025-10-27 17:00:00','AFTERNOON','PENDING','Tức ngực',NULL),('e543eef2-0828-4b0a-bdb0-6d9d4b23fac8','3dc435ec-fce1-4874-bb75-fb1218cec5cf','187de741-ddb2-40ac-af5b-fb8394abbc1b','9a37ee2f-baba-497f-8859-3dad2acb6509','2025-10-28 08:49:07','AFTERNOON','PENDING','Đau bụng lâu ngày','2025-10-29 08:00:01'),('e8adaa97-12df-4535-957c-d1b8e503530d','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','91339e73-a908-4c78-9cae-f7d0b70430aa','2025-11-12 13:43:56','AFTERNOON','CHECKED_IN','Đau ngực ','2025-11-12 08:15:00'),('ebd4949e-7d30-42fe-80ba-ce46fa72120c','3dc435ec-fce1-4874-bb75-fb1218cec5cf','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','9288216e-4bd4-4725-bc33-4b44290d9786','2025-10-24 17:00:00','AFTERNOON','CHECKED_IN','',NULL),('f91bb75e-127a-44c6-b930-a0c89d811d05','3dc435ec-fce1-4874-bb75-fb1218cec5cf','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','f0b13c5f-de15-400e-b59b-dd001c1d35fe','2025-10-26 17:00:00','MORNING','CHECKED_IN','Ngực đau quằn quại',NULL);
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill`
--

DROP TABLE IF EXISTS `bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill` (
  `id` char(36) NOT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `bill_type` enum('SERVICE','CLINICAL','MEDICINE') DEFAULT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `prescription_id` char(36) DEFAULT NULL,
  `medical_ticket_id` char(36) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `indication_ticket_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medical_ticket_id` (`medical_ticket_id`),
  KEY `FK_bill_indication_ticket` (`indication_ticket_id`),
  CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `bill_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `bill_ibfk_3` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `bill_ibfk_4` FOREIGN KEY (`medical_ticket_id`) REFERENCES `medical_ticket` (`id`),
  CONSTRAINT `FK_bill_indication_ticket` FOREIGN KEY (`indication_ticket_id`) REFERENCES `indication_ticket` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill`
--

LOCK TABLES `bill` WRITE;
/*!40000 ALTER TABLE `bill` DISABLE KEYS */;
INSERT INTO `bill` VALUES ('6b076c7d-6c6f-4731-9da5-f5be10242693',400000.00,'SERVICE','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'2025-10-20 23:28:56','02565b17-698d-43ba-a70f-d972ed93d903'),('883a6bc7-af9d-44cb-b47b-b19487c84db9',400000.00,'SERVICE','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'2025-10-20 15:29:05','02565b17-698d-43ba-a70f-d972ed93d903'),('bfd4d0ed-c130-4396-889b-0575321f13df',400000.00,'SERVICE','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'2025-10-20 23:14:54','02565b17-698d-43ba-a70f-d972ed93d903'),('cdf0f9ef-8daa-4c69-9270-aff0f0f40262',150000.00,'CLINICAL','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'af0b957c-d6d8-4b8d-bb51-6a648f791b8a','2025-11-27 16:57:35',NULL);
/*!40000 ALTER TABLE `bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_result`
--

DROP TABLE IF EXISTS `image_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_result` (
  `id` char(36) NOT NULL,
  `indication_id` char(36) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `result` text,
  `conclusion` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `indication_id` (`indication_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `image_result_ibfk_1` FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket` (`id`),
  CONSTRAINT `image_result_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `image_result_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_result`
--

LOCK TABLES `image_result` WRITE;
/*!40000 ALTER TABLE `image_result` DISABLE KEYS */;
INSERT INTO `image_result` VALUES ('abab517b-d9d2-4e7e-863c-eccfbd0237c8','02565b17-698d-43ba-a70f-d972ed93d903','/uploads/xray/1760875926007-779166247.jpg','XRAY-1760875926051-02565b17-698d-43ba-a70f-d972ed93d903','484af5f4-f6d1-4dea-962f-963d43bdf6e6','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','Gãy xương sườn ','Gãy dập xương sườn, chấn thương phổi nhẹ','2025-10-19 19:12:06');
/*!40000 ALTER TABLE `image_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indication_ticket`
--

DROP TABLE IF EXISTS `indication_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `indication_ticket` (
  `id` char(36) NOT NULL,
  `medical_ticket_id` char(36) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `diagnosis` text,
  `total_fee` decimal(12,2) DEFAULT '0.00',
  `indication_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `barcode` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `medical_ticket_id` (`medical_ticket_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `indication_ticket_ibfk_1` FOREIGN KEY (`medical_ticket_id`) REFERENCES `medical_ticket` (`id`),
  CONSTRAINT `indication_ticket_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `indication_ticket_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indication_ticket`
--

LOCK TABLES `indication_ticket` WRITE;
/*!40000 ALTER TABLE `indication_ticket` DISABLE KEYS */;
INSERT INTO `indication_ticket` VALUES ('02565b17-698d-43ba-a70f-d972ed93d903','bb64facd-bac4-4f9d-ba7a-3fa74b54f681','3dc435ec-fce1-4874-bb75-fb1218cec5cf','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','Chấn thương ngực',400000.00,'2025-10-19 12:05:38','CD-2025-10-19T12-05-38-000Z-02565b17-698d-43ba-a70f-d972ed93d903'),('2840a04f-b977-4f80-ba6b-8212e0dc6659','a03d9e52-fd39-4d63-8f7b-7a3be57ddc8d','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi nhẹ',200000.00,'2025-11-19 08:46:32','CD-2025-11-19T08-46-32-000Z-2840a04f-b977-4f80-ba6b-8212e0dc6659'),('3fd114f1-980a-4497-afa7-5e2c24fb6c94','25ce44e3-414a-4b62-ac2c-fcf95808ff30','3dc435ec-fce1-4874-bb75-fb1218cec5cf','dcc82bd7-8c2e-475b-a872-167258d7c060','Viêm phổi',200000.00,'2025-11-23 20:52:35','CD-20251123-B4QQ'),('71d31291-fe30-4470-9a4c-de0e33b12679','f568f320-e264-4677-86f1-cb10403e6cdb','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi',200000.00,'2025-11-13 19:53:10','CD-2025-11-13T19-53-10-000Z-71d31291-fe30-4470-9a4c-de0e33b12679'),('98b255d7-c44c-4d31-bc0f-171d2b766814','28c3979c-4ae9-4a25-995c-391099583396','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi',200000.00,'2025-11-22 16:14:48','CD-20251122-WDNZ'),('e5aed056-86f4-4fb0-8a2f-ed2e9b5c52a6','f568f320-e264-4677-86f1-cb10403e6cdb','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi',200000.00,'2025-11-13 18:20:23','CD-2025-11-13T18-20-23-000Z-e5aed056-86f4-4fb0-8a2f-ed2e9b5c52a6'),('fa19575f-865a-4d7e-9266-d0ff50ba9d76','f568f320-e264-4677-86f1-cb10403e6cdb','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi',200000.00,'2025-11-13 18:48:40','CD-2025-11-13T18-48-40-000Z-fa19575f-865a-4d7e-9266-d0ff50ba9d76'),('fd6ed160-fa8c-4dec-bb58-eb5d54253b6f','f568f320-e264-4677-86f1-cb10403e6cdb','3dc435ec-fce1-4874-bb75-fb1218cec5cf','088587a1-9332-4f3c-9c52-6d6d5d6fa751','Viêm phổi',200000.00,'2025-11-13 18:54:15','CD-2025-11-13T18-54-15-000Z-fd6ed160-fa8c-4dec-bb58-eb5d54253b6f');
/*!40000 ALTER TABLE `indication_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_test_result`
--

DROP TABLE IF EXISTS `lab_test_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_test_result` (
  `id` char(36) NOT NULL,
  `indication_id` char(36) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `result` text,
  `conclusion` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `indication_id` (`indication_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `lab_test_result_ibfk_1` FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket` (`id`),
  CONSTRAINT `lab_test_result_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `lab_test_result_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_test_result`
--

LOCK TABLES `lab_test_result` WRITE;
/*!40000 ALTER TABLE `lab_test_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_test_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_record`
--

DROP TABLE IF EXISTS `medical_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_record` (
  `id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `history` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `medical_record_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_record_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_record`
--

LOCK TABLES `medical_record` WRITE;
/*!40000 ALTER TABLE `medical_record` DISABLE KEYS */;
INSERT INTO `medical_record` VALUES ('25fdd325-497b-4863-ac73-c7ecf45285e2','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-23 21:10:27','2025-11-23 21:10:27'),('58019201-7c57-4a48-b6bc-bac0d61dbf44','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-23 20:53:16','2025-11-23 20:53:16'),('86b61dfc-aed8-4a43-831b-dd083fdbe561','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-13 18:20:23','2025-11-13 18:20:23'),('c60047d7-1fa6-46dc-94fe-5d04614d2494','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-23 20:52:35','2025-11-23 20:52:35'),('d911df55-90e8-475a-9d55-10a4b9fe2410','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-23 09:03:39','2025-11-23 09:03:39'),('e99f15f9-ea4e-4699-b4dd-8184e513b634','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'2025-11-23 20:53:32','2025-11-23 20:53:32');
/*!40000 ALTER TABLE `medical_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_service`
--

DROP TABLE IF EXISTS `medical_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_service` (
  `id` char(36) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_type` enum('EXAMINATION','TEST','IMAGING','OTHER') DEFAULT 'EXAMINATION',
  `service_price` decimal(12,2) DEFAULT NULL,
  `room_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `medical_service_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_service`
--

LOCK TABLES `medical_service` WRITE;
/*!40000 ALTER TABLE `medical_service` DISABLE KEYS */;
INSERT INTO `medical_service` VALUES ('05a16ce3-9434-4107-9039-856ac3cd5cba','X-quang ngực ngang','IMAGING',200000.00,'4cc072b0-7c49-4345-8e26-7bee7db40e81'),('f03ae281-6656-46de-931c-346ce15c5961','X-quang ngực thẳng','IMAGING',200000.00,'4cc072b0-7c49-4345-8e26-7bee7db40e81');
/*!40000 ALTER TABLE `medical_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_ticket`
--

DROP TABLE IF EXISTS `medical_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_ticket` (
  `id` char(36) NOT NULL,
  `visit_id` char(36) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `assigned_doctor_id` char(36) DEFAULT NULL,
  `issued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `clinical_fee` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `visit_id` (`visit_id`),
  KEY `assigned_doctor_id` (`assigned_doctor_id`),
  CONSTRAINT `medical_ticket_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`id`),
  CONSTRAINT `medical_ticket_ibfk_2` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `staff` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_ticket`
--

LOCK TABLES `medical_ticket` WRITE;
/*!40000 ALTER TABLE `medical_ticket` DISABLE KEYS */;
INSERT INTO `medical_ticket` VALUES ('25ce44e3-414a-4b62-ac2c-fcf95808ff30','25b10d3e-4fe9-48a6-baab-aced70e6b52f','MT-20251123-001-DCC82-HRXA','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-24 03:50:16',NULL),('28c3979c-4ae9-4a25-995c-391099583396','055e9399-7069-4aa6-bb9f-fdbf02fa4279','MT-20251122-001-08858-BALC','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-22 22:57:42',NULL),('528ed52f-2846-4802-b8ef-243ce1d27ee2','dec47d90-6893-4c25-bf6b-d24a106b304e','MT-20251112-001-08858-BG3A','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-12 20:54:47',NULL),('5ef7204b-23fe-49d7-b9a0-1d91824d8bd1','da835435-bc7f-4246-b0d8-15be816be032','MT-20251127-002-DCC82-MQ0F','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-27 16:56:48',150000),('6be612b7-48c2-461d-8bfb-af2f4a4294a8','c4d79b26-94e2-40b3-8c05-d81cef812dd0','MT-20251119-002-08858-G3GF','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-19 21:49:08',NULL),('8c75ae09-3175-48d8-b0dd-0e4d40089b98','2e9a4467-dd70-4ebb-9702-bb84e02824e5','MT-20251031-001-FF360-OE0B','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-31 08:13:41',NULL),('a03d9e52-fd39-4d63-8f7b-7a3be57ddc8d','1e84bce0-bcc9-4ca8-9a4f-cc00df16e8fb','MT-20251119-001-08858-4SGR','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-19 15:45:51',NULL),('af0b957c-d6d8-4b8d-bb51-6a648f791b8a','329bfc8e-889b-4922-86f6-65649797e246','MT-20251127-001-DCC82-X1WA','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-27 16:32:04',150000),('bb64facd-bac4-4f9d-ba7a-3fa74b54f681','74a61739-42e2-42f3-9fb8-a02218a29054','MT-20251019-001-1C0EC-MHQ7','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-19 16:24:55',NULL),('f568f320-e264-4677-86f1-cb10403e6cdb','dbd3b804-200f-457d-bbd0-56379d431821','MT-20251113-001-08858-HRSI','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-14 01:04:51',NULL);
/*!40000 ALTER TABLE `medical_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `manufacturer` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES ('00c7929b-510e-4477-bc89-459f8b98ff2d','Budesonide 100mcg',22000.00,'Hô hấp','Chai',100,'AstraZeneca','2026-11-30','Thuốc xịt viêm mũi, hen suyễn'),('052d23dc-1215-4a7c-99e9-94acf614c4ce','Phenylephrine 10mg',15000.00,'Hô hấp','Viên',100,'Sanofi','2026-02-28','Giảm nghẹt mũi'),('07225839-7bf6-4faf-bddc-bf6f6f8c02db','Azithromycin 500mg',35000.00,'Hô hấp','Viên',100,'DHG Pharma','2026-06-30','Kháng sinh điều trị viêm phế quản'),('0884c13c-f447-419b-9e4d-38318de70bb2','Ceftriaxone 1g',40000.00,'Hô hấp','Lọ',100,'AstraZeneca','2025-10-31','Kháng sinh tiêm đường tĩnh mạch'),('0ae99575-f12d-4de6-af51-55aedb7d72fc','Cefixime 200mg',31000.00,'Hô hấp','Viên',100,'DHG Pharma','2025-11-30','Điều trị viêm phổi, viêm họng'),('0ba23640-0e3d-4009-88fc-0a965bf7ffe2','Amoxicillin/Clavulanate 625mg',35000.00,'Hô hấp','Viên',100,'Traphaco','2025-09-30','Kháng sinh phổ rộng'),('111a99cf-fdab-45c9-943f-23d6640ae1df','Omeprazole 20mg',20000.00,'Hô hấp','Viên',100,'GlaxoSmithKline','2024-09-30','Hỗ trợ viêm thực quản, trào ngược'),('191821ff-193d-43ee-80fb-34aaa2f53abb','Salbutamol 2mg',20000.00,'Hô hấp','Viên',100,'Pymepharco','2026-10-31','Thuốc giãn phế quản'),('221e250b-c5c5-4fdc-8faa-cbc877819453','Montelukast 10mg',22000.00,'Hô hấp','Viên',100,'DHG Pharma','2026-04-30','Chống viêm đường hô hấp'),('2520245c-6184-4a75-994c-f8171a2e0a55','Ranitidine 150mg',18000.00,'Hô hấp','Viên',100,'Sanofi','2024-10-31','Hỗ trợ giảm trào ngược dạ dày (kèm hô hấp do viêm thực quản)'),('26c253f2-01c1-4b99-911b-9cc4e69bddcf','Erythromycin 250mg',30000.00,'Hô hấp','Viên',100,'Sanofi','2026-01-31','Kháng sinh điều trị viêm phế quản'),('34ad3b24-9c91-4ee5-914e-280751495ae2','Clindamycin 300mg',35000.00,'Hô hấp','Viên',100,'Pymepharco','2025-04-30','Điều trị viêm phế quản, viêm xoang'),('3f8db901-4f70-4245-85e6-aab42c18fb6b','Guaifenesin 100mg',13000.00,'Hô hấp','Viên',100,'Traphaco','2026-05-31','Giúp long đờm'),('407343c6-91cb-4f2f-9d50-0d6fc7222a9e','Ambroxol 30mg',18000.00,'Hô hấp','Viên',100,'DHG Pharma','2026-11-30','Giúp long đờm'),('43ce5cdd-368f-41dc-8f83-d0a620549240','Pantoprazole 40mg',22000.00,'Hô hấp','Viên',100,'AstraZeneca','2024-08-31','Hỗ trợ viêm thực quản, trào ngược'),('52fc41c3-84a6-4e7b-a924-3d8529dc9ad5','Levofloxacin 500mg',50000.00,'Hô hấp','Viên',100,'Sanofi','2025-08-31','Kháng sinh điều trị nhiễm trùng hô hấp'),('541ca614-7338-4740-b15b-b72fe9dc7c1b','Isoniazid 300mg',27000.00,'Hô hấp','Viên',100,'Sanofi','2025-02-28','Điều trị lao phổi'),('6aee34c9-00e0-4ce2-a3f7-2d4ccc3a427e','Ipratropium 20mcg',23000.00,'Hô hấp','Chai',100,'DHG Pharma','2026-10-31','Thuốc giãn phế quản'),('7e2b7150-8649-429f-8918-1e7edaa964fb','Esomeprazole 20mg',24000.00,'Hô hấp','Viên',100,'Traphaco','2024-07-31','Hỗ trợ viêm thực quản, trào ngược'),('8698e186-60d7-4c4f-985f-3faa8a7ba1ca','Rifampicin 300mg',29000.00,'Hô hấp','Viên',100,'Traphaco','2025-01-31','Điều trị lao phổi'),('97107ad3-72d1-4bd5-a1fe-1a0b4f331260','Dextromethorphan 15mg',12000.00,'Hô hấp','Viên',100,'Công ty Dược phẩm Việt Nam','2026-08-31','Thuốc giảm ho'),('973fe886-3809-495a-8303-9fd781372d96','Bromhexine 8mg',14000.00,'Hô hấp','Viên',100,'Pymepharco','2026-07-31','Giúp long đờm, giảm ho'),('9d59d319-375e-4f9d-8ad9-7c3c8ad90b01','Amoxicillin 500mg',30000.00,'Hô hấp','Viên',100,'Traphaco','2026-05-31','Kháng sinh phổ rộng'),('a9b61ff9-281d-4d96-90c6-c19d7a9de626','Albuterol 90mcg',25000.00,'Hô hấp','Chai',100,'Traphaco','2026-09-30','Hỗ trợ hen suyễn'),('ab63858b-5395-43e8-b72b-fca2c647a737','Fluticasone 50mcg',20000.00,'Hô hấp','Chai',100,'GlaxoSmithKline','2026-12-31','Thuốc xịt chống viêm mũi'),('ad904c86-d528-4e1e-ba5e-3a01705ac95f','Loratadine 10mg',16000.00,'Hô hấp','Viên',100,'Sanofi','2026-06-30','Chống dị ứng, viêm mũi'),('aee12abc-563d-46a0-bcfe-d5cf956fa262','Moxifloxacin 400mg',52000.00,'Hô hấp','Viên',100,'DHG Pharma','2025-07-31','Kháng sinh phổ rộng'),('af5d490b-fff3-4a2d-94e3-2f80e71a0913','Pyrazinamide 500mg',32000.00,'Hô hấp','Viên',100,'DHG Pharma','2024-12-31','Điều trị lao phổi'),('b0756424-04a0-4328-8056-be6483846619','Oxacillin 500mg',27000.00,'Hô hấp','Viên',100,'Traphaco','2025-12-31','Kháng sinh phổ hẹp'),('b5bd483c-72f7-4d1f-bdf2-546de4c601fa','Clarithromycin 250mg',32000.00,'Hô hấp','Viên',100,'Sanofi','2026-04-30','Kháng sinh điều trị viêm phổi'),('bcc56bf1-20d1-4a1c-b816-6d3303a87618','Ethambutol 400mg',30000.00,'Hô hấp','Viên',100,'AstraZeneca','2024-11-30','Điều trị lao phổi'),('c2207a95-e774-487c-a896-21f4b1bae078','Cefuroxime 250mg',30000.00,'Hô hấp','Viên',100,'AstraZeneca','2026-07-31','Kháng sinh điều trị nhiễm trùng hô hấp'),('c728b992-96bb-4fe0-99a3-3c1917081a23','Azelastine 0.1%',24000.00,'Hô hấp','Chai',100,'GlaxoSmithKline','2025-03-31','Xịt mũi chống dị ứng'),('e3695c9d-a105-4e50-903b-e87249bc7d67','Budesonide 400mcg (Thuốc hít)',350000.00,NULL,NULL,0,'AstraZeneca',NULL,'Corticosteroid dạng hít, kiểm soát hen suyễn và COPD dài hạn.'),('e3e84c38-31ea-499d-a78b-38a0f905fe5a','Mometasone 50mcg',24000.00,'Hô hấp','Chai',100,'GlaxoSmithKline','2026-08-31','Xịt mũi chống viêm'),('e4fb09ac-4ca6-475c-8c06-00943b4b94f9','Oxymetazoline 0.05%',18000.00,'Hô hấp','Chai',100,'Traphaco','2026-01-31','Thuốc xịt mũi'),('e9d21c08-fa64-474e-808e-617da1083450','Doxycycline 100mg',28000.00,'Hô hấp','Viên',100,'Công ty Dược phẩm Việt Nam','2026-03-31','Kháng sinh đường hô hấp'),('f015fff3-2a58-45a2-9c99-d5634554a9c4','Paracetamol 500mg',15000.00,'Hô hấp','Viên',100,'Traphaco','2026-12-31','Thuốc hạ sốt, giảm đau'),('f2586ea5-a95d-420f-ac1d-a4123a871df1','Roxithromycin 150mg',33000.00,'Hô hấp','Viên',100,'Pymepharco','2026-02-28','Điều trị viêm xoang, viêm họng'),('fe74ebb1-ef87-4d54-9ab3-b9a24e56ed67','Cetirizine 10mg',15000.00,'Hô hấp','Viên',100,'Sanofi','2026-09-30','Thuốc chống dị ứng');
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `patient_full_name` varchar(255) DEFAULT NULL,
  `patient_phone` varchar(255) DEFAULT NULL,
  `patient_address` varchar(255) DEFAULT NULL,
  `patient_dob` date DEFAULT NULL,
  `patient_gender` enum('NAM','NU','KHAC') DEFAULT NULL,
  `fatherORmother_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fatherORmother_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `respiratory_rate` varchar(50) DEFAULT NULL,
  `medical_history` text,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `pulse_rate` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('088587a1-9332-4f3c-9c52-6d6d5d6fa751','c74efddb-8882-4cbb-9202-9764e63886de','Bui Truong Son','0943595945','Vĩnh Phúc','2003-08-09','NAM',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('187de741-ddb2-40ac-af5b-fb8394abbc1b',NULL,'Nguyễn Hải Lâm','03838348485','Hà Nội','1998-02-28','NAM','','',176,70,'AB','110/72','Covid',NULL,NULL),('1c0ec944-f5cf-4d9a-bf62-86f9d2520939',NULL,'Bùi Nga Vân','03737447344','Vĩnh Phúc','1945-10-10','NAM','','',165,45,'O','110','Suy dinh dưỡng',NULL,NULL),('28a2b580-e3de-43d0-bc62-677f8803c3cf','263ad536-96a6-4fb3-98ff-bf1f724bbb08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('2f007740-3eb5-4ad9-91e8-4d671f5f3c01','97c90f1e-0812-4cd1-9f4a-f613748b90f7','Bùi Trường Sơn','03527238233',NULL,'2003-09-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('3292013f-125d-4c64-a54e-52a7fd208ae9',NULL,'Nguyễn Hải Long','03838348484','Hà Nội','1998-02-28','NAM','','',176,70,'AB','110/72','Covid',NULL,NULL),('43129136-5393-4dad-a93e-168786b3e710','360e07e6-8186-450e-9f55-137229ede3ed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('49a2bf06-0cba-42b6-a9b9-414d4503f66c','9290a62c-e5ad-4a46-a264-5a03dec577c7',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('663fc22b-4acb-4cbd-aa72-a100e31d9a8c','fddecab6-99d1-44d4-a685-f3842c7b7364',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('6af7d70c-ef46-48fc-87fa-4c540264d405','96a49147-d774-4a21-96ef-3de957a8ed85','Bùi Trường Sơn','0358146217',NULL,'2025-10-19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('82242804-50bc-4a93-b79b-f9d93c3a571a',NULL,'Nguyễn Việt Anh','09383494943','Hà Nội','1990-02-10','NAM','Nguyễn Việt Hoàng','',170,60,'O','','',NULL,NULL),('a55abefa-31e6-4a60-9d7e-f30867c3662b','97581ff6-7474-4d83-bcda-5e1e78ba558b','Do Thi Bich Ngoc','0349393483',NULL,'1980-09-02',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('b4c52108-5e14-46ed-8909-d173ab9d1383','fa18f9ce-b949-47f5-9460-f7014703314d','Nguyen Truong Son','09485833334',NULL,'2003-04-25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dcc82bd7-8c2e-475b-a872-167258d7c060','5f65d785-bec0-4d84-9cbc-b1c9a7f358ae','Nguyễn Xuân Trung','0358146229','Thanh Hóa','2003-11-15','NAM',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('e518e353-aed9-440e-9dfa-6204808de962','7a36de5b-5c6a-4ad9-b1d9-b90cd02079f3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ff360204-61f9-4df9-9e0a-bf84022799c1','1316b058-0f3d-4124-96d8-fd8ab96b91c1','Hà Đức Quyền','0393493484',NULL,'2005-02-17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` char(36) NOT NULL,
  `bill_id` char(36) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `payment_method` enum('CASH','BANK_TRANSFER','VNPAY') DEFAULT NULL,
  `payment_status` enum('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  `paid_by_user_id` char(36) DEFAULT NULL,
  `paid_by_patient_id` char(36) DEFAULT NULL,
  `paid_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payment_user` (`paid_by_user_id`),
  KEY `fk_payment_patient` (`paid_by_patient_id`),
  KEY `fk_payment_bill` (`bill_id`),
  CONSTRAINT `fk_payment_bill` FOREIGN KEY (`bill_id`) REFERENCES `bill` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_patient` FOREIGN KEY (`paid_by_patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_user` FOREIGN KEY (`paid_by_user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bill` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('49fc330b-7eaf-4c27-ac2b-bb44a97e51f4','bfd4d0ed-c130-4396-889b-0575321f13df',400000.00,'BANK_TRANSFER','PENDING',NULL,'1c0ec944-f5cf-4d9a-bf62-86f9d2520939','2025-10-20 23:16:06'),('56921a16-2db3-438d-87a0-570abbaee3dc','cdf0f9ef-8daa-4c69-9270-aff0f0f40262',150000.00,'CASH','SUCCESS','5f65d785-bec0-4d84-9cbc-b1c9a7f358ae',NULL,'2025-11-27 16:57:39'),('72dc2f9f-f655-49b3-8d4e-d649e1ba1642','883a6bc7-af9d-44cb-b47b-b19487c84db9',400000.00,'BANK_TRANSFER','PENDING',NULL,'1c0ec944-f5cf-4d9a-bf62-86f9d2520939','2025-10-20 15:44:49'),('bc2cb0dc-ff48-44db-be75-5568e28dedb9','6b076c7d-6c6f-4731-9da5-f5be10242693',400000.00,'BANK_TRANSFER','PENDING',NULL,'1c0ec944-f5cf-4d9a-bf62-86f9d2520939','2025-10-20 23:29:36'),('f585ad5e-b340-4a89-bedd-cb34eca6ace0','6b076c7d-6c6f-4731-9da5-f5be10242693',10000.00,'BANK_TRANSFER','PENDING',NULL,'1c0ec944-f5cf-4d9a-bf62-86f9d2520939','2025-10-20 23:32:55'),('fe4e8177-bdd3-4eee-9d9b-91bca2f4bede','6b076c7d-6c6f-4731-9da5-f5be10242693',400000.00,'BANK_TRANSFER','PENDING',NULL,'1c0ec944-f5cf-4d9a-bf62-86f9d2520939','2025-10-20 23:29:11');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `id` char(36) NOT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `medical_record_id` char(36) DEFAULT NULL,
  `conclusion` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `return_date` date DEFAULT NULL,
  `total_fee` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `medical_record_id` (`medical_record_id`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `prescription_ibfk_3` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES ('08fe089e-5dc1-4ed6-a9ff-4072e2dcfcea','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phế quản','2025-11-14 05:20:07',NULL,0.00),('2419ab62-81f8-4417-b9a8-06b5e702d247','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','d911df55-90e8-475a-9d55-10a4b9fe2410','Viêm phổi cấp','2025-11-23 00:00:00','2025-11-30',0.00),('2474af9c-3167-4184-8127-73dc8f169244','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','86b61dfc-aed8-4a43-831b-dd083fdbe561','Theo dõi thêm sau 7 ngày','2025-11-23 00:00:00','2025-11-30',840000.00),('38bc1089-2490-458b-9ec4-b81c06725b79','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','25fdd325-497b-4863-ac73-c7ecf45285e2','Viêm phổi cấp','2025-11-24 00:00:00','2025-12-01',300000.00),('4581d3a6-88c8-4064-9d84-b224e650b687','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','58019201-7c57-4a48-b6bc-bac0d61dbf44','Viêm phổi cấp','2025-11-24 00:00:00','2025-12-01',0.00),('4b4df9f4-e96a-4276-a771-c776b1f4ccee','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','e99f15f9-ea4e-4699-b4dd-8184e513b634','Viêm phổi cấp','2025-11-24 00:00:00','2025-12-01',0.00),('56e98bd0-fedd-4161-b658-cd33aca3570e','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 04:11:58',NULL,0.00),('7fd5d719-c15a-4fd4-9ad6-30b55671180e','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 05:14:07',NULL,0.00),('8d72910a-028a-4c52-b103-b6ced637ba02','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 03:02:49',NULL,0.00),('acbaee5a-8786-457e-b433-12d48035421a','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 03:48:12',NULL,0.00),('cd5bb697-b0f0-4b92-ae05-7a89cc559500','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 05:27:08',NULL,0.00),('cd8b63a6-dfe4-44b6-a83c-2c31aa80347e','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-14 05:25:05',NULL,0.00),('f796ab74-98d4-417b-94aa-8d0681d73a91','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,'Viêm phổi cấp','2025-11-19 21:59:12',NULL,0.00);
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_detail`
--

DROP TABLE IF EXISTS `prescription_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_detail` (
  `id` char(36) NOT NULL,
  `prescription_id` char(36) DEFAULT NULL,
  `medicine_id` char(36) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `dosage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescription_detail_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `prescription_detail_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_detail`
--

LOCK TABLES `prescription_detail` WRITE;
/*!40000 ALTER TABLE `prescription_detail` DISABLE KEYS */;
INSERT INTO `prescription_detail` VALUES ('06f7f601-8f4a-4052-8280-068c330bb779','2474af9c-3167-4184-8127-73dc8f169244','bcc56bf1-20d1-4a1c-b816-6d3303a87618',10,'2 viên tối sau ăn'),('2d0ed7da-8c1a-4c06-a5b4-5bb7de8cfc20','acbaee5a-8786-457e-b433-12d48035421a','f015fff3-2a58-45a2-9c99-d5634554a9c4',1,''),('2da33d2d-3f62-48cb-a578-406235820082','cd8b63a6-dfe4-44b6-a83c-2c31aa80347e','f015fff3-2a58-45a2-9c99-d5634554a9c4',1,'2 viên sau ăn'),('2f9d5e36-3068-4bfd-afd3-2ff27d086991','2474af9c-3167-4184-8127-73dc8f169244','c2207a95-e774-487c-a896-21f4b1bae078',10,'2 viên sáng sau ăn'),('332ffe94-ddeb-4c94-88a3-6071e955f0ff','f796ab74-98d4-417b-94aa-8d0681d73a91','221e250b-c5c5-4fdc-8faa-cbc877819453',1,''),('4dfab299-4b7a-46fa-9ca0-05152dcda8a5','f796ab74-98d4-417b-94aa-8d0681d73a91','43ce5cdd-368f-41dc-8f83-d0a620549240',1,''),('56167afd-962c-4de5-85cb-2ad4ae38e590','08fe089e-5dc1-4ed6-a9ff-4072e2dcfcea','43ce5cdd-368f-41dc-8f83-d0a620549240',1,''),('5e4a03bb-2463-41dc-8c50-4e6563209531','56e98bd0-fedd-4161-b658-cd33aca3570e','43ce5cdd-368f-41dc-8f83-d0a620549240',1,''),('6095e2b3-56a5-4448-bdfb-3df236c92057','56e98bd0-fedd-4161-b658-cd33aca3570e','43ce5cdd-368f-41dc-8f83-d0a620549240',1,''),('967405e6-8a81-41d1-b015-cd1505916e8a','2474af9c-3167-4184-8127-73dc8f169244','c728b992-96bb-4fe0-99a3-3c1917081a23',10,'2 viên sáng sau ăn, 1 viên tối trước ăn'),('b4d3d4ef-0a81-4e55-bbff-647b361589e6','7fd5d719-c15a-4fd4-9ad6-30b55671180e','f015fff3-2a58-45a2-9c99-d5634554a9c4',1,'2 viên trước ăn'),('cdacdd5c-75ee-449a-acf4-fe13c2de2ecb','cd5bb697-b0f0-4b92-ae05-7a89cc559500','f015fff3-2a58-45a2-9c99-d5634554a9c4',1,'2 viên sau ăn'),('e7baee90-cde8-4352-aa60-6be2c3c93c24','38bc1089-2490-458b-9ec4-b81c06725b79','f015fff3-2a58-45a2-9c99-d5634554a9c4',20,'2 viên sau ăn, ngày uống 2 lần');
/*!40000 ALTER TABLE `prescription_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `id` char(36) NOT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `room_type` enum('LAB','DIAGNOSTIC','CLINICAL') DEFAULT NULL,
  `floor` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES ('4cc072b0-7c49-4345-8e26-7bee7db40e81','Chẩn đoán 1','DIAGNOSTIC',1);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_indication`
--

DROP TABLE IF EXISTS `service_indication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_indication` (
  `id` char(36) NOT NULL,
  `indication_id` char(36) DEFAULT NULL,
  `medical_service_id` char(36) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `queue_number` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `indication_id` (`indication_id`),
  KEY `medical_service_id` (`medical_service_id`),
  CONSTRAINT `service_indication_ibfk_1` FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket` (`id`),
  CONSTRAINT `service_indication_ibfk_2` FOREIGN KEY (`medical_service_id`) REFERENCES `medical_service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_indication`
--

LOCK TABLES `service_indication` WRITE;
/*!40000 ALTER TABLE `service_indication` DISABLE KEYS */;
INSERT INTO `service_indication` VALUES ('03e81f54-469a-4407-9b4d-a0c623bdf32f','02565b17-698d-43ba-a70f-d972ed93d903','05a16ce3-9434-4107-9039-856ac3cd5cba',1,1,NULL),('2ac82d21-dbf2-4ec8-a942-31e68a64ac17','e5aed056-86f4-4fb0-8a2f-ed2e9b5c52a6','f03ae281-6656-46de-931c-346ce15c5961',1,2,NULL),('5b3240d9-d1bc-44c2-b213-f447d688b031','3fd114f1-980a-4497-afa7-5e2c24fb6c94','f03ae281-6656-46de-931c-346ce15c5961',1,1,NULL),('7ece34bc-5a85-46cc-8d2d-0a713431eb11','2840a04f-b977-4f80-ba6b-8212e0dc6659','f03ae281-6656-46de-931c-346ce15c5961',1,6,NULL),('9390adc7-54cf-49eb-9b06-b2ea52ee7489','02565b17-698d-43ba-a70f-d972ed93d903','f03ae281-6656-46de-931c-346ce15c5961',1,1,NULL),('a7d5459f-0356-42ac-b856-cb17520c36ba','fd6ed160-fa8c-4dec-bb58-eb5d54253b6f','f03ae281-6656-46de-931c-346ce15c5961',1,4,NULL),('be99202d-7d5a-414f-806d-110ab0ce0583','fa19575f-865a-4d7e-9266-d0ff50ba9d76','f03ae281-6656-46de-931c-346ce15c5961',1,3,NULL),('d2994946-64a8-4c51-b76c-ecb4051ccc4a','71d31291-fe30-4470-9a4c-de0e33b12679','f03ae281-6656-46de-931c-346ce15c5961',1,5,NULL),('ee8694e3-7d34-4069-901b-da2f83e1c551','98b255d7-c44c-4d31-bc0f-171d2b766814','f03ae281-6656-46de-931c-346ce15c5961',1,1,NULL);
/*!40000 ALTER TABLE `service_indication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `doctor_type` enum('CLINICAL','DIAGNOSTIC','LAB') DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `room_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_staff_room` (`room_id`),
  CONSTRAINT `fk_staff_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE SET NULL,
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES ('3aaec10d-7f4c-4bf6-9e4c-5eb5da1d007e','055153c1-c0ac-4f26-b14c-d12e617c7d34','Lễ Tân','Trưởng phòng','0393934953',NULL,1,NULL),('3dc435ec-fce1-4874-bb75-fb1218cec5cf','f139dd72-08fa-435f-be88-2255ecf16cdd','Hô Hấp','Trưởng khoa','0393934934','CLINICAL',1,NULL),('484af5f4-f6d1-4dea-962f-963d43bdf6e6','c1976629-cb77-4462-8520-ef99d94d9e7f','Chẩn đoán','Trưởng khoa','0393934953','DIAGNOSTIC',1,NULL);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` char(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('NAM','NU','KHAC') DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `user_role` enum('PATIENT','DOCTOR','PHARMACIST','RECEPTIONIST','OWNER','ADMIN') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('055153c1-c0ac-4f26-b14c-d12e617c7d34','nguyentruongson','$2b$10$MdTMev6kkEgF2971f1UZIefITM3GMaqUMp20jwRIDdY/h7mmBTtri','nguyentruongson@gmail.com','Nguyễn Trường Sơn',NULL,NULL,NULL,NULL,NULL,'RECEPTIONIST','2025-10-19 16:18:30','2025-10-19 16:18:30'),('1316b058-0f3d-4124-96d8-fd8ab96b91c1','haducquyen','guest','haducquyen@gmail.com','Hà Đức Quyền',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-31 03:53:17','2025-10-31 03:53:17'),('1ad2b267-4ccb-43d6-9131-c670bbb059eb','owneraccount','$2a$12$wrgSDFeYRc5SMSaNkzWlRO40erdZmQSkc/Dh01DLiPqfMtEVwhg1u','owner@gmail.com','Đỗ Thị Bích Ngọc','1986-02-02','NU',NULL,'Hà Nội','0928383223','OWNER','2025-10-19 16:13:26','2025-11-08 21:45:31'),('263ad536-96a6-4fb3-98ff-bf1f724bbb08','patient','$2b$10$Kd36c7w59HN1.L1HxLGgA.mAq3RUz0/ddNkyTxMDQ20KPEh4XouEG','patient@gmail.com','Nguyễn Hồng Ngọc','1999-02-02','NU',NULL,'Hà Nội','0928383223','PATIENT','2025-10-19 21:25:32','2025-10-19 21:25:32'),('360e07e6-8186-450e-9f55-137229ede3ed','sonbui2','$2b$10$G4AFjKQTGCIYA1Yeu.yQeu../ZfiQNboOWzBcmF0co.lmIw2zDD2y','buison.m002@gmail.com','Bùi Trường Sơn','2003-08-09','NAM',NULL,'Vĩnh Phúc','0358146217','PATIENT','2025-11-23 13:12:20','2025-11-23 13:12:20'),('43eb6db8-f890-439c-9d4d-123c0ee07fc0','sonbui1','$2b$10$Bi8xjtDJ1DjY3Cspri1T1.VJzIGTJeXvNZzuo4gDUxH9n.x/BOdvC','huongmaidoanh@gmail.com','Bùi Trường Sơn','2003-08-09','NAM',NULL,'VinhPhuc','0978813196','PATIENT','2025-10-21 21:44:31','2025-11-14 01:06:59'),('5f65d785-bec0-4d84-9cbc-b1c9a7f358ae','sonbui3','$2b$10$EtXx2BvMmbNp.gWRW2AOdOHQs/gOiyozT8fZCycixt8M08FCEe5Ya','buisonvpvr@gmail.com','Nguyễn Xuân Trung','2003-11-15','NAM','/static/avatar/1764350068021-158627817.png','Thanh Hóa','0358146220','PATIENT','2025-11-23 20:59:36','2025-11-29 00:31:20'),('7a36de5b-5c6a-4ad9-b1d9-b90cd02079f3','yennguyen','$2b$10$ahzq3zdje4Voambm./mJye4a.CzC42sX6hkdmniYNa4i2LCM2fUS.','yennguyen@gmail.com','Nguyễn Hải Yến','2003-01-23','NU',NULL,'Vĩnh Phúc','0983483844','PATIENT','2025-10-24 22:17:31','2025-10-24 22:17:31'),('9290a62c-e5ad-4a46-a264-5a03dec577c7','sonbuivp','$2b$10$JQwJS24ii0ZMkBXiiyD5e.ZpT9mXmnNZn5RWLqrFu9D9OMs4PtT7i','buisonvpvtt1@gmail.com','Bùi Trường Sơn','2003-08-09','NAM',NULL,'Thổ Tang, Vĩnh Phúc','0358146216','PATIENT','2025-11-06 23:47:40','2025-11-06 23:47:40'),('96a49147-d774-4a21-96ef-3de957a8ed85','buison.m003','guest','buison.m003@gmail.com','Bùi Trường Sơn',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-26 20:59:39','2025-10-26 20:59:39'),('97581ff6-7474-4d83-bcda-5e1e78ba558b','bichngocdt','guest','bichngocdt@gmail.com','Do Thi Bich Ngoc',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-31 10:49:38','2025-10-31 10:49:38'),('97c90f1e-0812-4cd1-9f4a-f613748b90f7','buisonvv','guest','buisonvv@gmail.com','Bùi Trường Sơn',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-30 00:38:23','2025-10-30 00:38:23'),('afa397a1-4513-4af5-9055-37647b384848','test','$2b$10$.jGvNVh2w8H40Eo37ZolUubzNG4.itiS2tQQWGDDqpcXUCcYung.y','buitruongsonvppp@gmail.com',NULL,NULL,'NAM',NULL,'Vinh Phuc','098384834843','PATIENT','2025-10-31 10:28:13','2025-10-31 10:28:13'),('c1976629-cb77-4462-8520-ef99d94d9e7f','buitruongson','$2b$10$J5QA7CPF24dN5e9GwNxCNu8z5IYr.Wo7hyj3mM8VlZlryJqaOFv.2','buitruongson@gmail.com','Bùi Trường Sơn',NULL,NULL,NULL,NULL,NULL,'DOCTOR','2025-10-19 16:17:41','2025-10-19 16:17:41'),('c74efddb-8882-4cbb-9202-9764e63886de','buitruongsonnn','guest','buitruongsonnn@gmail.com','Bui Truong Son',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-31 10:47:08','2025-10-31 10:47:08'),('f139dd72-08fa-435f-be88-2255ecf16cdd','legiaquang','$2b$10$ksIxQ05NIpZnX0k7xjiG9OzI8muEKMK89udggWMFx/CGV.zJfZwKe','legiaquang@gmail.com','Lê Gia Quang',NULL,NULL,'/static/avatar/1761572571540-638562783.png',NULL,NULL,'DOCTOR','2025-10-19 16:16:39','2025-10-27 20:42:51'),('f931454b-cfbf-4ff8-b459-5bf7e572ab71','buisonvpvttt','guest','buisonvpvttt@gmail.com','Bùi Trường Sơn',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-26 20:57:24','2025-10-26 20:57:24'),('fa18f9ce-b949-47f5-9460-f7014703314d','nguyentruongsonvpp','guest','nguyentruongsonvpp@gmail.com','Nguyen Truong Son',NULL,NULL,NULL,NULL,NULL,'PATIENT','2025-10-31 10:48:21','2025-10-31 10:48:21'),('fddecab6-99d1-44d4-a685-f3842c7b7364','sonbui9803','$2b$10$ukCmSKy0.82a69nYPAR1Oe0GcFnGsBR/kVleIVja9x5epajHMA/q.','buisonvpvtttt@gmail.com','Bui Truong Son','2003-08-09','NAM',NULL,'Dinh Cong Thuong, Hà Nội','0358146275','PATIENT','2025-11-05 12:37:12','2025-11-05 12:37:12');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit`
--

DROP TABLE IF EXISTS `visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit` (
  `id` char(36) NOT NULL,
  `patient_id` char(36) DEFAULT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `appointment_id` char(36) DEFAULT NULL,
  `medical_record_id` char(36) DEFAULT NULL,
  `visit_type` enum('WALK_IN','APPOINTMENT') DEFAULT NULL,
  `queue_number` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `checked_in_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `visit_status` enum('CHECKED_IN','DOING','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_printed` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `medical_record_id` (`medical_record_id`),
  CONSTRAINT `visit_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `visit_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `visit_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`),
  CONSTRAINT `visit_ibfk_4` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit`
--

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
INSERT INTO `visit` VALUES ('055e9399-7069-4aa6-bb9f-fdbf02fa4279','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','696eff3a-3cb1-4c3d-8149-12f7330ab553',NULL,'APPOINTMENT',1,'2025-11-22 22:57:27','2025-11-22 12:58:59',NULL,'DOING',NULL),('17da405f-20aa-4bab-a32f-d6dbec267a4c','28a2b580-e3de-43d0-bc62-677f8803c3cf','3dc435ec-fce1-4874-bb75-fb1218cec5cf','8f19803b-e667-4b87-80fc-d931aadd9353',NULL,'APPOINTMENT',4,'2025-10-28 16:23:34','2025-10-28 16:23:31',NULL,'CHECKED_IN',NULL),('1e84bce0-bcc9-4ca8-9a4f-cc00df16e8fb','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','053db44e-c037-418d-b4b5-c44ba82677ad',NULL,'APPOINTMENT',1,'2025-11-19 15:04:12','2025-11-19 15:05:17',NULL,'COMPLETED',NULL),('25b10d3e-4fe9-48a6-baab-aced70e6b52f','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','8b330460-bd88-40a7-be76-2792338adf67',NULL,'APPOINTMENT',1,'2025-11-24 03:49:32','2025-11-24 16:50:13',NULL,'DOING',NULL),('2cb30dd1-02dc-4f35-b157-bfc0f175866b','187de741-ddb2-40ac-af5b-fb8394abbc1b','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'WALK_IN',2,'2025-10-28 14:49:08','2025-10-28 07:31:09',NULL,'CHECKED_IN',NULL),('2e9a4467-dd70-4ebb-9702-bb84e02824e5','ff360204-61f9-4df9-9e0a-bf84022799c1','3dc435ec-fce1-4874-bb75-fb1218cec5cf','ba19cff0-c51a-4cca-8a12-be096a3ffe18',NULL,'APPOINTMENT',1,'2025-10-31 03:55:56','2025-10-31 07:56:01',NULL,'COMPLETED',NULL),('3085fe7e-a28f-4994-9a49-37eca95eb0af','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','3dc435ec-fce1-4874-bb75-fb1218cec5cf','3d4dce6e-1f2d-4911-acaa-bbf97d5fbe7c',NULL,'APPOINTMENT',1,'2025-10-28 14:34:19','2025-10-28 07:31:09',NULL,'CHECKED_IN',NULL),('329bfc8e-889b-4922-86f6-65649797e246','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','925705ad-600a-4893-9c4b-d0eeb306360a',NULL,'APPOINTMENT',1,'2025-11-27 16:32:04','2025-11-27 09:32:01','2025-11-27 09:32:01','DOING',1),('74a61739-42e2-42f3-9fb8-a02218a29054','1c0ec944-f5cf-4d9a-bf62-86f9d2520939','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'WALK_IN',1,'2025-10-19 16:24:40','2025-10-19 09:21:34',NULL,'CHECKED_IN',NULL),('7c0b1f72-a2b3-4522-bf8f-9a8d7ec1384e','28a2b580-e3de-43d0-bc62-677f8803c3cf','3dc435ec-fce1-4874-bb75-fb1218cec5cf','a327e102-dc82-4626-9877-8e1686c06b78',NULL,'APPOINTMENT',1,'2025-10-29 10:37:08','2025-10-29 10:36:04',NULL,'DOING',NULL),('7ca46157-bad3-44e6-b0e3-1c06518fce68','ff360204-61f9-4df9-9e0a-bf84022799c1','3dc435ec-fce1-4874-bb75-fb1218cec5cf','ba19cff0-c51a-4cca-8a12-be096a3ffe18',NULL,'APPOINTMENT',2,'2025-10-31 10:25:22','2025-10-31 03:25:21',NULL,'COMPLETED',NULL),('7ec2e739-7b39-4f7a-8cba-204777995651','ff360204-61f9-4df9-9e0a-bf84022799c1','3dc435ec-fce1-4874-bb75-fb1218cec5cf','ba19cff0-c51a-4cca-8a12-be096a3ffe18',NULL,'APPOINTMENT',3,'2025-10-31 10:26:51','2025-10-31 03:26:50',NULL,'COMPLETED',NULL),('82d0ba4f-1ee3-4d6e-b1b7-64058cadd34b','2f007740-3eb5-4ad9-91e8-4d671f5f3c01','3dc435ec-fce1-4874-bb75-fb1218cec5cf','0b1f623d-6b7d-4530-a397-bdd5fa23ad41',NULL,'WALK_IN',1,'2025-10-30 00:41:11','2025-10-30 08:38:01',NULL,'DOING',NULL),('97b228dd-d782-4a3c-91f0-0ca7e9fffb63','82242804-50bc-4a93-b79b-f9d93c3a571a','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'WALK_IN',3,'2025-10-28 16:22:15','2025-10-28 16:22:31',NULL,'CHECKED_IN',NULL),('b24ab1fb-6e94-4d26-9ed7-6bc301898e71','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','696eff3a-3cb1-4c3d-8149-12f7330ab553',NULL,'APPOINTMENT',1,'2025-11-23 13:42:11','2025-11-23 13:41:20',NULL,'COMPLETED',NULL),('ba9002a2-70bc-4827-b97a-f570e62b2fb2','3292013f-125d-4c64-a54e-52a7fd208ae9','3dc435ec-fce1-4874-bb75-fb1218cec5cf',NULL,NULL,'WALK_IN',1,'2025-10-28 14:32:31','2025-10-28 07:31:09',NULL,'CHECKED_IN',NULL),('c4d79b26-94e2-40b3-8c05-d81cef812dd0','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','14b5adf7-99c4-42b0-886c-1a97e82f2a52',NULL,'APPOINTMENT',2,'2025-11-19 21:48:58','2025-11-19 21:48:17',NULL,'CHECKED_IN',NULL),('d1005f2d-377c-4b27-9d12-dafdb00b7120','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','7deeae5a-7154-44aa-ba3f-85b3c335c467',NULL,'APPOINTMENT',4,'2025-10-31 10:50:05','2025-10-31 03:50:04',NULL,'DOING',NULL),('da835435-bc7f-4246-b0d8-15be816be032','dcc82bd7-8c2e-475b-a872-167258d7c060','3dc435ec-fce1-4874-bb75-fb1218cec5cf','925705ad-600a-4893-9c4b-d0eeb306360a',NULL,'APPOINTMENT',2,'2025-11-27 16:56:47','2025-11-27 09:56:47','2025-11-27 09:56:47','CHECKED_IN',1),('dbd3b804-200f-457d-bbd0-56379d431821','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','50cd1614-44c0-4bcb-a455-74c4ce01444d',NULL,'APPOINTMENT',1,'2025-11-14 01:04:37','2025-11-14 08:00:58',NULL,'DOING',NULL),('dec47d90-6893-4c25-bf6b-d24a106b304e','088587a1-9332-4f3c-9c52-6d6d5d6fa751','3dc435ec-fce1-4874-bb75-fb1218cec5cf','e8adaa97-12df-4535-957c-d1b8e503530d',NULL,'APPOINTMENT',1,'2025-11-12 20:54:22','2025-11-12 13:44:48',NULL,'DOING',NULL);
/*!40000 ALTER TABLE `visit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_schedule`
--

DROP TABLE IF EXISTS `work_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_schedule` (
  `id` char(36) NOT NULL,
  `staff_id` char(36) NOT NULL,
  `work_date` date NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `details` text,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `work_schedule_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_schedule`
--

LOCK TABLES `work_schedule` WRITE;
/*!40000 ALTER TABLE `work_schedule` DISABLE KEYS */;
INSERT INTO `work_schedule` VALUES ('03c1e298-be85-483c-8ee5-d7411bb39d6d','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-27','2025-10-27 16:00:59','2025-10-27 23:30:59',NULL),('2d905580-8b8e-4a86-ad1b-3bbfd8612f49','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-29','2025-10-29 08:00:00','2025-10-29 18:00:00',NULL),('2f92ea51-032a-4c94-bd25-6796a872e5c6','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-31','2025-10-31 08:00:00','2025-10-31 18:00:00',NULL),('2fe41e6a-d85d-476c-82bd-653805197683','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-19','2025-11-19 08:00:00','2025-11-19 18:00:00',NULL),('34818a81-f11c-43a9-bd22-a78f32eafd1c','3aaec10d-7f4c-4bf6-9e4c-5eb5da1d007e','2025-11-08','2025-11-08 18:00:00','2025-11-08 23:00:00',NULL),('356eead6-c311-4652-a8f1-59b6f4ed831e','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-14','2025-11-14 08:00:00','2025-11-14 18:00:00',NULL),('3fb757fc-801f-4112-bce0-447953189ebc','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-28','2025-11-28 17:00:00','2025-11-28 23:00:00',NULL),('41ccddaa-672c-4b02-b838-35d9807fbf81','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-27','2025-11-27 17:00:00','2025-11-27 23:00:00',NULL),('48d7de46-0323-484d-a1bd-e982ff7a9ddc','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-13','2025-11-13 08:00:00','2025-11-13 18:00:00',NULL),('4d986a0e-9423-4d6d-8c20-46b5b5fe651d','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-09','2025-11-09 18:00:00','2025-11-09 23:00:00',NULL),('5b41c04b-e6a7-4f13-bacd-28419845f446','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-11','2025-11-11 08:00:00','2025-11-11 18:00:00',NULL),('5b6b99c9-9e76-4e56-a2cc-13eaaaf06545','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-28','2025-10-28 16:30:01','2025-10-28 16:45:01',NULL),('6480d74d-4579-4888-8629-7ed659322a68','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-23','2025-11-23 13:00:00','2025-11-23 21:00:00',NULL),('79444174-ec25-456c-a888-b4c19f3b4e16','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-08','2025-11-08 18:00:00','2025-11-08 23:00:00',NULL),('80ab51b9-1f16-4ebb-91ee-dec533eada9b','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-24','2025-11-24 17:00:00','2025-11-24 23:00:00',NULL),('8ad6980f-b2a2-4962-adb6-3231c70fa1b5','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-25','2025-10-25 07:00:00',NULL,NULL),('8b54bca8-12cf-41e5-9ca0-00e487c547d2','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-22','2025-11-22 08:00:00','2025-11-22 17:00:00',NULL),('93fac09f-3ebc-4619-8738-5ef98193b047','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-28','2025-10-28 08:00:00','2025-10-28 18:00:00',NULL),('9ad5a836-2a89-4a91-8934-643f83fef4d1','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-30','2025-10-30 08:00:01','2025-10-30 18:00:01',NULL),('b0193237-4b2e-4821-9730-99e7ef011722','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-03','2025-11-03 08:00:00','2025-11-03 18:00:00',NULL),('b5a99a0e-476b-47c1-afd1-bed987a3aa3e','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-12','2025-11-12 08:00:00','2025-11-12 18:00:00',NULL),('d10c012d-9dbc-4db8-accb-f25af96ad7c2','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-28','2025-10-28 16:45:01','2025-10-28 20:45:01',NULL),('d7a55082-e3f4-4de6-abb2-c4b5279988aa','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-12-02','2025-12-02 17:00:00','2025-12-02 22:00:00',NULL),('de8f855e-8f2f-47c2-8217-7b8b92496eed','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-10-24','2025-10-24 07:00:00',NULL,NULL),('ebf58dac-1555-4598-b1d1-ab7c09296e62','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-15','2025-11-15 08:00:00','2025-11-15 23:50:00',NULL),('ed28cb1a-5438-4fc7-bacf-44042304b44f','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-12-04','2025-12-04 08:00:00','2025-12-04 17:00:00',NULL),('f915972b-eeef-441d-8e66-862122e93870','3dc435ec-fce1-4874-bb75-fb1218cec5cf','2025-11-25','2025-11-25 17:00:00','2025-11-25 23:00:00',NULL);
/*!40000 ALTER TABLE `work_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_schedule_detail`
--

DROP TABLE IF EXISTS `work_schedule_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_schedule_detail` (
  `id` char(36) NOT NULL,
  `schedule_id` char(36) DEFAULT NULL,
  `slot_start` datetime NOT NULL,
  `slot_end` datetime NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `work_schedule_detail_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_schedule_detail`
--

LOCK TABLES `work_schedule_detail` WRITE;
/*!40000 ALTER TABLE `work_schedule_detail` DISABLE KEYS */;
INSERT INTO `work_schedule_detail` VALUES ('02952b73-a700-4d84-9b8d-a0d826fd253c','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:21:00','2025-10-31 08:30:00',0),('05cdc77c-5219-4069-bc34-66fb28cb4705','2fe41e6a-d85d-476c-82bd-653805197683','2025-11-19 08:15:00','2025-11-19 08:30:00',1),('06f844c0-1be5-4459-a66e-9bd8d4f77699','34818a81-f11c-43a9-bd22-a78f32eafd1c','2025-11-08 22:45:00','2025-11-08 23:00:00',0),('0a17aaa6-9b4b-4d0f-8ab2-22ad1958db32','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 22:15:00','2025-12-02 22:30:00',0),('0afed43f-24cd-41f7-a7a2-7abb596b81fe','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 20:15:00','2025-11-27 20:30:00',0),('0ce2e65b-c5ef-4b9a-a2d7-bfa5f5735aeb','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 20:15:00','2025-12-02 20:30:00',0),('0dda9ce3-b141-4c1e-ac99-13067ace6121','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 15:30:00','2025-11-23 15:45:00',0),('0eb13492-2fb0-45df-91f3-400eb1621278','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 19:30:00','2025-11-15 19:45:00',0),('1063416c-d58b-4c89-b141-1f844b4193ef','79444174-ec25-456c-a888-b4c19f3b4e16','2025-11-08 22:15:00','2025-11-08 22:30:00',0),('11b0c199-d60c-4ba7-ad60-a70eb37db618','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 19:30:00','2025-11-25 19:45:00',0),('13371643-9b6e-4495-b3d6-0fddeb9348de','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 20:00:00','2025-12-02 20:15:00',0),('14edbb43-7538-4a30-a5b0-7bd79d0ce772','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 10:45:00','2025-11-14 11:00:00',0),('15f65c6e-da99-4af0-80c3-dddd53801118','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 09:00:00','2025-11-14 09:15:00',0),('1610d4ba-1e8f-40a2-89c1-5f9c2437a3d2','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 18:15:00','2025-11-24 18:30:00',0),('16eb7819-0b6a-4e35-a58b-f737f06addd4','79444174-ec25-456c-a888-b4c19f3b4e16','2025-11-08 22:45:00','2025-11-08 23:00:00',0),('173af46d-3416-44c7-8467-ac1d8b0f1da5','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 20:15:00','2025-11-28 20:30:00',0),('18215c77-53fa-48df-82b9-dbf50b616eb7','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 13:15:00','2025-11-23 13:30:00',1),('1a963353-c277-456a-8ea0-1d69ef0b6166','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 21:15:00','2025-12-02 21:30:00',0),('1add615a-5363-45e0-981f-00a625feb5f1','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 21:30:00','2025-11-28 21:45:00',0),('1b2bd406-60d2-40d9-9bb1-8658d9fcd93e','48d7de46-0323-484d-a1bd-e982ff7a9ddc','2025-11-13 08:00:00','2025-11-13 08:15:00',0),('1ca2610a-fa7b-4bf4-a0e4-2371c95e3cbf','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:11:00','2025-11-03 08:20:00',0),('1d29a606-e3f0-40bb-8f0a-201a785ab888','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 08:45:00','2025-11-14 09:00:00',0),('1da04caf-f4b5-4b03-9850-29501fe9fee3','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 21:00:00','2025-12-02 21:15:00',0),('21126863-fbe9-433b-b672-b1dc879e10ec','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 17:45:00','2025-11-27 18:00:00',0),('2207f519-a9fc-4b3e-97bb-146e988e7bc5','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 08:00:00','2025-11-15 08:15:00',0),('22fb9d07-91dc-4966-a42d-b38bb1238310','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 19:00:00','2025-11-27 19:15:00',0),('2447df37-056a-43ef-8db6-ce2683e31056','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 17:45:00','2025-11-24 18:00:00',0),('24b5864c-1c85-4e66-9994-598617d0f16d','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 14:45:00','2025-11-23 15:00:00',1),('24d81fe0-bf3c-44d9-87f5-a6d5536fa8ca','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 20:45:00','2025-11-15 21:00:00',0),('27822b30-6b7f-4182-9e81-3dd6979f99af','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 20:00:00','2025-11-27 20:15:00',0),('28ae68b0-f83e-4e32-ba51-bef50e34e427','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 19:30:00','2025-12-02 19:45:00',0),('2a087b42-d150-4562-8549-0130ed03e09d','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 20:30:00','2025-11-15 20:45:00',0),('2aef18aa-cbe6-4e2f-b201-915a47bb9187','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 17:30:00','2025-12-02 17:45:00',0),('2c61510f-b324-40ec-b856-74a65d336044','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:51:01','2025-10-28 09:00:01',1),('2c631262-cf71-4601-bc5f-e8acd6a5bae6','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 17:30:00','2025-11-27 17:45:00',0),('2c87f60a-6c68-4ebb-9ddc-b14819ac68bf','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 22:30:00','2025-12-02 22:45:00',0),('30b4087d-62f3-409d-a480-dc872ae67d97','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:41:01','2025-10-29 08:50:01',1),('31632b8c-4a10-4e1b-badc-b7ac18768e37','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 10:15:00','2025-11-14 10:30:00',0),('353731ef-f5bc-4d5f-98e0-71ad8c96b19a','34818a81-f11c-43a9-bd22-a78f32eafd1c','2025-11-08 22:30:00','2025-11-08 22:45:00',0),('377ccccf-5771-4917-aad0-b3b942de9de7','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:41:00','2025-11-03 08:50:00',0),('381667c5-4788-4049-84c7-b79905a5dd0e','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 11:15:00','2025-11-14 11:30:00',0),('3826e0d0-d115-4416-8bbe-6a6c0b99257a','b5a99a0e-476b-47c1-afd1-bed987a3aa3e','2025-11-12 08:45:00','2025-11-12 09:00:00',0),('3a42ff0c-7e76-4d9d-926a-6306ac920acc','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 17:30:00','2025-11-28 17:45:00',0),('3b262d09-d6ed-4888-bee7-b2b3cffe52f7','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:31:01','2025-10-28 08:40:01',1),('3b2bf2c6-cb26-4dfa-9ced-32cfebcd42a1','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 11:30:00','2025-11-14 11:45:00',0),('3b6a649a-085d-401c-a99c-9995b01a7a1b','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:31:01','2025-10-29 08:40:01',0),('3c40fc9f-3ac1-434b-b33c-a2481a37513c','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-13 08:15:00','2025-11-13 08:30:00',0),('3ce67662-b7b2-401a-a012-ed715f870151','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 18:45:00','2025-11-28 19:00:00',0),('3e1612d9-38d1-4cf9-bcc6-f168419e5fe2','2fe41e6a-d85d-476c-82bd-653805197683','2025-11-19 08:15:00','2025-11-19 08:30:00',0),('3e977f6d-122a-416b-918d-99ef4b709f88','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 21:45:00','2025-11-28 22:00:00',0),('3eee2a84-2c26-4a9b-bb9a-17d2ea85f777','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 18:30:00','2025-11-25 18:45:00',0),('408496ff-974d-46c7-917c-c7ef9fb98783','b5a99a0e-476b-47c1-afd1-bed987a3aa3e','2025-11-12 09:00:00','2025-11-12 09:15:00',0),('40ee365f-780a-4deb-8525-15d92b4ff44f','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:51:01','2025-10-29 09:00:01',0),('423bca78-263d-47a7-bab4-abd25c9ea371','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 17:15:00','2025-12-02 17:30:00',0),('42f7a92c-e52a-443a-ae8a-128c956b7133','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 18:45:00','2025-12-02 19:00:00',0),('439af04a-7160-44cf-a9e8-122cb4291dfb','b5a99a0e-476b-47c1-afd1-bed987a3aa3e','2025-11-12 08:30:00','2025-11-12 08:45:00',0),('43b8218c-7550-470e-b0c5-4df6923f73b5','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 17:00:00','2025-11-28 17:15:00',1),('442d372e-d00e-483c-b5ad-bf6d756f7931','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 22:15:00','2025-11-28 22:30:00',0),('45f614d2-90bc-4fb4-9f6f-71021c129714','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 17:45:00','2025-11-28 18:00:00',0),('4671748d-f72c-43e8-9aa9-a8a0553a34bf','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 20:30:00','2025-12-02 20:45:00',0),('493dfaf0-ce9b-4176-b4e0-5ce8f1cf52a1','8b54bca8-12cf-41e5-9ca0-00e487c547d2','2025-11-22 08:15:00','2025-11-22 08:30:00',0),('4976bff8-946c-443e-8ba7-3b6f47ec147e','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 16:00:00','2025-11-23 16:15:00',0),('5021dbfe-8919-4c31-8ea0-a5d2020dc402','48d7de46-0323-484d-a1bd-e982ff7a9ddc','2025-11-13 08:45:00','2025-11-13 09:00:00',0),('50e8ac9b-7e7a-4b93-98d3-4e0f5f3e1a9d','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 10:30:00','2025-11-14 10:45:00',0),('52ead330-e7f6-4b24-9b3f-94d53a23dada','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:00:00','2025-11-03 08:10:00',0),('540bc163-8462-4cb0-a236-ba7bbc9eab54','4d986a0e-9423-4d6d-8c20-46b5b5fe651d','2025-11-09 22:45:00','2025-11-09 23:00:00',0),('54c9b477-1f54-4dfa-90d5-e8cc5f8da5ae','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 14:30:00','2025-11-23 14:45:00',1),('56598be6-58ad-4849-b656-64bc223e210a','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 17:00:00','2025-11-25 17:15:00',1),('56b04efb-26f3-4383-8224-791ee35aeb88','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 19:45:00','2025-11-25 20:00:00',0),('573f0999-7f6e-4f41-abb6-b6271c0d0103','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:41:01','2025-10-28 08:50:01',1),('57f43ee4-c64d-48df-97f4-6d52ca006be3','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:31:00','2025-10-31 08:40:00',0),('5a112652-7ff2-4c41-b1a0-4bce00f95d27','8ad6980f-b2a2-4962-adb6-3231c70fa1b5','2025-10-24 07:00:01','2025-10-24 07:30:01',1),('5ae8b913-6efe-4efd-8972-3f9df83349a6','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 19:30:00','2025-11-28 19:45:00',0),('5b155bb8-524d-44be-a519-8da5253eebfc','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:11:00','2025-10-31 08:20:00',0),('5b746d80-7037-4413-bf8c-43318b265250','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 18:30:00','2025-11-27 18:45:00',0),('5d91dbb0-c837-42fb-9616-83b02f2eee0e','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 19:00:00','2025-11-28 19:15:00',0),('5e279560-4ded-4262-a3ff-0a65c9d8276e','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:11:01','2025-10-29 08:20:01',0),('5e7e1579-fbc3-416c-80ee-a765995228d5','8b54bca8-12cf-41e5-9ca0-00e487c547d2','2025-11-22 08:30:00','2025-11-22 08:45:00',0),('628360b3-6815-49da-a73f-cff4867ee46f','8b54bca8-12cf-41e5-9ca0-00e487c547d2','2025-11-22 08:15:00','2025-11-22 08:30:00',0),('64a94b10-09b2-4941-8f50-6863537d1bce','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 13:15:00','2025-11-14 13:30:00',0),('6768c45e-2ac0-4053-a151-1547862af8d6','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 17:15:00','2025-11-25 17:30:00',0),('6a6e3346-7840-4f9a-89d7-aace93dd5a28','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 13:30:00','2025-11-23 13:45:00',0),('6b0bef6d-e113-4cce-bba1-a7f1bcf508fe','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 21:00:00','2025-11-28 21:15:00',0),('6e9367c4-ec74-4893-906a-7dba5f80dd4f','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 13:45:00','2025-11-23 14:00:00',0),('704610e4-1a6e-4b9c-b815-2ef948f292ef','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:11:01','2025-10-28 08:20:01',1),('729b6b63-dc69-4fdd-bdda-31afcba2e92c','48d7de46-0323-484d-a1bd-e982ff7a9ddc','2025-11-13 08:30:00','2025-11-13 08:45:00',0),('7331bdb3-55cf-4e99-a220-74a0739c149b','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 11:45:00','2025-11-14 12:00:00',0),('737ed28f-64a6-4493-acc4-bb48d4455245','4d986a0e-9423-4d6d-8c20-46b5b5fe651d','2025-11-09 22:00:00','2025-11-09 22:15:00',0),('748ba084-7930-4ee9-83e0-3d0fc28610b3','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 19:00:00','2025-11-25 19:15:00',0),('76caf2b4-04ec-4652-9652-ec174c915c5f','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 22:30:00','2025-11-28 22:45:00',0),('783412d3-2de8-42fc-9330-7789e3b29053','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 18:15:00','2025-11-28 18:30:00',0),('7915975b-fed9-47ef-a3fc-914e4cd70ec2','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 17:30:00','2025-11-25 17:45:00',0),('79cbed5d-0e00-4e11-bedd-65de5355314d','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 18:30:00','2025-11-28 18:45:00',0),('7e158add-3e5b-4822-a39a-509451ae46a1','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:31:00','2025-11-03 08:40:00',0),('8045777b-df5f-46b9-b5c0-cdf5f6e3211e','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 20:15:00','2025-11-15 20:30:00',0),('827ce72d-3fa9-417f-a667-6fe04cad8f98','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 18:45:00','2025-11-25 19:00:00',0),('84d77140-3ab5-4e56-a406-928635f1d949','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 17:15:00','2025-11-24 17:30:00',0),('85519fc5-fe8d-406d-9eca-03fd8c8ad7fd','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 18:00:00','2025-11-25 18:15:00',0),('85edd9f8-6c85-4d4a-9216-555d4058571c','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 17:00:00','2025-11-27 17:15:00',1),('86a4f8af-55b6-4995-b02a-085811a26a82','d10c012d-9dbc-4db8-accb-f25af96ad7c2','2025-10-28 16:46:00','2025-10-28 17:00:00',1),('870f36b0-9122-4b46-8c20-f5e49e6e8ccf','d10c012d-9dbc-4db8-accb-f25af96ad7c2','2025-10-28 17:01:00','2025-10-28 17:10:00',0),('8876ead5-f17a-4c8c-969c-39a0805c5206','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 09:45:00','2025-11-14 10:00:00',0),('89271684-6247-4222-9a2a-5265e4ab24dc','34818a81-f11c-43a9-bd22-a78f32eafd1c','2025-11-08 22:00:00','2025-11-08 22:15:00',0),('8942ca9e-4d76-4af1-a392-e3148b70033a','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:00:01','2025-10-28 08:10:01',1),('8b3bfbf0-951b-4685-9edb-63eb70cf8c76','5b41c04b-e6a7-4f13-bacd-28419845f446','2025-11-11 08:15:00','2025-11-11 08:30:00',0),('8eb2c7d3-1d15-425f-9bcf-c8ec2151cbb6','93fac09f-3ebc-4619-8738-5ef98193b047','2025-10-28 08:21:01','2025-10-28 08:30:01',1),('908681c1-cd97-413b-8e37-a8030c0231fa','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 17:00:00','2025-12-02 17:15:00',1),('91339e73-a908-4c78-9cae-f7d0b70430aa','b5a99a0e-476b-47c1-afd1-bed987a3aa3e','2025-11-12 08:15:00','2025-11-12 08:30:00',1),('919678e8-7dbf-4d8c-8a59-d2ef688e786e','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 17:30:00','2025-11-24 17:45:00',0),('919f0d6a-84de-4482-a838-209bfa1679b4','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 16:30:00','2025-11-23 16:45:00',0),('91a918d4-610b-46e0-a030-9eb66637cb4d','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 21:15:00','2025-11-28 21:30:00',0),('9288216e-4bd4-4725-bc33-4b44290d9786','8ad6980f-b2a2-4962-adb6-3231c70fa1b5','2025-10-24 07:31:01','2025-10-24 08:00:01',1),('92cfa538-2d25-4388-8c41-0e04d5b6e397','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 08:30:00','2025-11-14 08:45:00',1),('92f4b92b-1b11-4249-b15c-7cfe237787c2','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 17:45:00','2025-11-25 18:00:00',0),('933203e1-bc29-4d7a-b89e-b15458d65e45','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 21:30:00','2025-12-02 21:45:00',0),('93566159-7710-48e3-b5b2-24eb4632aeb8','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 18:15:00','2025-12-02 18:30:00',0),('953fde4f-5d9d-4973-bab0-f86e09c906a4','9ad5a836-2a89-4a91-8934-643f83fef4d1','2025-10-30 08:16:00','2025-10-30 08:20:00',1),('95f01748-cb22-48b7-9099-4b9a2fac5b4a','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 18:00:00','2025-11-27 18:15:00',0),('969a053e-cb70-40c0-a194-c5ad00543bd2','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 20:30:00','2025-11-27 20:45:00',0),('971bd4c3-f00b-4d8b-86d7-67e33ac53ac6','b5a99a0e-476b-47c1-afd1-bed987a3aa3e','2025-11-12 08:00:00','2025-11-12 08:15:00',1),('973dc782-f7c3-4509-9ea6-54643835bca1','8b54bca8-12cf-41e5-9ca0-00e487c547d2','2025-11-22 08:45:00','2025-11-22 09:00:00',0),('978d1942-3679-4e28-85b7-24a4715153a8','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 18:15:00','2025-11-25 18:30:00',0),('98eabbbf-e542-4502-b232-bb4162972e46','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 22:45:00','2025-12-02 23:00:00',0),('9a37ee2f-baba-497f-8859-3dad2acb6509','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:00:01','2025-10-30 08:10:01',1),('9acbe228-40db-403d-aab3-531c773fa622','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 19:15:00','2025-12-02 19:30:00',0),('9c837132-a826-49ac-8630-72d18e7507d1','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 18:30:00','2025-11-24 18:45:00',0),('a07bb900-7496-4eb8-99d6-f3f95e6c7748','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 20:45:00','2025-11-28 21:00:00',0),('a0e3d459-24a5-4ee6-bc4e-c2c4cd71c662','5b41c04b-e6a7-4f13-bacd-28419845f446','2025-11-11 08:30:00','2025-11-11 08:45:00',0),('a29b5f5f-dda9-4218-8cbe-516fc60aaf5d','4d986a0e-9423-4d6d-8c20-46b5b5fe651d','2025-11-09 22:15:00','2025-11-09 22:30:00',0),('a3e2155a-f2ee-4b3b-bd3d-289bcca5d309','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 17:45:00','2025-12-02 18:00:00',0),('a625d3e0-600f-44f7-9654-8d213c3b5c51','4d986a0e-9423-4d6d-8c20-46b5b5fe651d','2025-11-09 22:30:00','2025-11-09 22:45:00',0),('a64082c9-162a-4c90-8ba4-7a5522c81a00','2d905580-8b8e-4a86-ad1b-3bbfd8612f49','2025-10-29 08:21:01','2025-10-29 08:30:01',1),('aa343128-c9a6-40ec-b1f6-fd4658db3e8b','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:51:00','2025-11-03 09:00:00',0),('aa6c19de-3b41-4396-89a6-aa15ba2a7405','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 18:45:00','2025-11-27 19:00:00',0),('aa6eefce-194f-461c-9e86-e251cb5f9cf5','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 19:15:00','2025-11-25 19:30:00',0),('ab616d0a-869a-4dbb-bf5d-2a41f1e872f4','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 18:00:00','2025-11-24 18:15:00',0),('ae8f40fc-b464-4ccf-9970-0a0bd9276979','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 21:15:00','2025-11-15 21:30:00',0),('af4362a4-0930-4bb0-bb90-f754765fa0d2','8b54bca8-12cf-41e5-9ca0-00e487c547d2','2025-11-22 08:00:00','2025-11-22 08:15:00',0),('afe7583b-f19f-4d88-bd5d-064ab22fc9be','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 21:45:00','2025-12-02 22:00:00',0),('b355260a-aa04-4907-b47e-1cc170f5797b','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 19:15:00','2025-11-28 19:30:00',0),('b46e7020-1ecb-4a5c-aa02-c723ca37be44','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 13:00:00','2025-11-14 13:15:00',0),('b6a609ff-af1e-423e-99df-adb3b8c82a6e','5b6b99c9-9e76-4e56-a2cc-13eaaaf06545','2025-10-28 16:30:00','2025-10-28 16:45:26',0),('b710026e-057e-43cb-9fd6-6bd0e709ac01','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 18:00:00','2025-11-28 18:15:00',0),('b7dfb402-1810-4919-b90e-f912e7adee41','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 19:45:00','2025-11-27 20:00:00',0),('b9af08c6-6ac4-47b3-89fa-e469755a5035','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 14:15:00','2025-11-23 14:30:00',0),('bc568243-28f0-4484-adcc-7f47a017650d','b0193237-4b2e-4821-9730-99e7ef011722','2025-11-03 08:21:00','2025-11-03 08:30:00',0),('bee941a7-dcdd-4df3-a39d-191711d71b51','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 14:00:00','2025-11-23 14:15:00',1),('bf270ba3-9277-474b-8026-600680909a4d','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 11:41:25','2025-10-31 11:50:25',1),('bfbcbfbb-5275-4a7b-8765-0f616af1d1bc','2fe41e6a-d85d-476c-82bd-653805197683','2025-11-19 08:30:00','2025-11-19 08:45:00',0),('c085870d-f051-4574-8fd4-07ff3223e644','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 20:30:00','2025-11-28 20:45:00',0),('c08bcdcb-91ee-4938-91c4-23ce2af75684','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 15:00:00','2025-11-23 15:15:00',1),('c1900de1-fb83-42c2-8a5e-68ae2c5c4bc4','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 18:15:00','2025-11-27 18:30:00',0),('c31f8416-5f71-45a4-86a8-0742d09968ce','9ad5a836-2a89-4a91-8934-643f83fef4d1','2025-10-30 08:00:00','2025-10-30 08:15:00',0),('c37d3f4f-0a3c-4cc5-9833-3424052f276b','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 19:45:00','2025-11-15 20:00:00',0),('c388b2ed-5cc9-4254-96dc-9bd2ba065309','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 22:00:00','2025-12-02 22:15:00',0),('c4e49548-f8d4-440d-9b58-be1045e78033','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 17:15:00','2025-11-28 17:30:00',0),('c641b2d6-ab7f-4192-880e-240028181452','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:51:00','2025-10-31 09:00:00',1),('c735dbab-e286-41f6-a89e-2beacf1227e7','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 21:00:00','2025-11-15 21:15:00',0),('ccc476d6-adf4-4d0e-97ed-0225b88aa7eb','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 19:15:00','2025-11-27 19:30:00',0),('cdf24b2f-d1df-4035-810b-60e70e25379e','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 19:15:00','2025-11-15 19:30:00',0),('cf68467a-7542-4027-9d49-eb3179c8db3b','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 17:00:00','2025-11-24 17:15:00',1),('cf91b0c3-290c-4390-a8dd-c7c447050e50','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 18:30:00','2025-12-02 18:45:00',0),('d066e2e8-aaec-4867-bad7-7e11ebc62a31','5b41c04b-e6a7-4f13-bacd-28419845f446','2025-11-11 09:00:00','2025-11-11 09:15:00',0),('d1a67645-ff46-4e71-8377-5a342e65a1f7','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 19:00:00','2025-11-15 19:15:00',0),('d206d7ce-ea33-4d61-855e-1490d04933e4','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 22:45:00','2025-11-28 23:00:00',0),('d280b03b-1a68-493e-bf2a-10912a3ebdc4','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:00:00','2025-10-31 08:10:00',1),('d2fb7a6c-0233-4372-acf5-031c9339fbd3','5b41c04b-e6a7-4f13-bacd-28419845f446','2025-11-11 08:00:00','2025-11-11 08:15:00',0),('d3debbc1-25f1-4d28-820d-920c4388c435','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 18:00:00','2025-12-02 18:00:00',0),('d430a4d0-5b94-4bc3-bd4c-e8f012279277','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 19:00:00','2025-11-24 19:15:00',0),('d44d3853-0cf1-4355-9503-b7199c1b689d','79444174-ec25-456c-a888-b4c19f3b4e16','2025-11-08 22:00:00','2025-11-08 22:15:00',1),('d590a0fd-94bb-4326-9886-8297178c25f4','2fe41e6a-d85d-476c-82bd-653805197683','2025-11-19 08:00:00','2025-11-19 08:15:00',1),('d5b89af7-7ceb-4972-b6d9-f060af54d5f0','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 19:45:00','2025-12-02 20:00:00',0),('d70a917a-2012-44be-bd62-865f455c1cc0','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 09:30:00','2025-11-14 09:45:00',0),('da1d0754-d435-4aac-939a-605942236349','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 19:00:00','2025-12-02 19:15:00',0),('dace6559-17a4-4bbc-95fd-373ff30d3c8c','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 15:15:00','2025-11-23 15:30:00',1),('dcf73e0e-f953-4489-8d40-51128e08cda2','5b41c04b-e6a7-4f13-bacd-28419845f446','2025-11-11 08:45:00','2025-11-11 09:00:00',0),('df23a7fe-690f-4732-a085-194c23cfa47e','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 20:00:00','2025-11-28 20:15:00',0),('e1d82065-80d4-431e-8227-7b87ce2f15fb','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 11:00:00','2025-11-14 11:15:00',0),('e2c01605-833b-4511-a0f1-ba304806a852','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 16:15:00','2025-11-23 16:30:00',0),('e494cd77-7931-4de1-bc2e-0fd794ad6236','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 17:15:00','2025-11-27 17:30:00',0),('e8ddffa5-3b37-4be1-9bca-09052c9c3a47','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 15:45:00','2025-11-23 16:00:00',0),('ea80a1fd-249f-4cca-8d51-a3f8f8621a82','ebf58dac-1555-4598-b1d1-ab7c09296e62','2025-11-15 20:00:00','2025-11-15 20:15:00',0),('eb16fbc6-c2f1-4b8b-b6a1-06aa7ecd9131','d10c012d-9dbc-4db8-accb-f25af96ad7c2','2025-10-28 17:11:00','2025-10-28 17:20:00',0),('eb5a5ffb-5a2e-45d6-80f8-637a42bb18a1','34818a81-f11c-43a9-bd22-a78f32eafd1c','2025-11-08 22:15:00','2025-11-08 22:30:00',0),('ebbfe2ce-71de-4911-a07c-38dc13448327','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 22:00:00','2025-11-28 22:15:00',0),('ecac6ad9-db04-483a-a36a-d0836319db58','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 20:45:00','2025-11-27 21:00:00',0),('ee841674-7244-4184-bd1b-1c573fb9ab41','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 21:00:00','2025-11-25 21:15:00',0),('ef594741-bb29-468d-a16b-9c04e6565986','41ccddaa-672c-4b02-b838-35d9807fbf81','2025-11-27 19:30:00','2025-11-27 19:45:00',0),('f04e2f0b-4ca2-46f5-b32c-f67b795ddc3a','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 09:15:00','2025-11-14 09:30:00',0),('f0b13c5f-de15-400e-b59b-dd001c1d35fe','03c1e298-be85-483c-8ee5-d7411bb39d6d','2025-10-27 23:00:16','2025-10-27 23:30:16',1),('f2db1c21-44b8-4795-b1f0-222d222cb3a5','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-13 08:00:00','2025-11-13 08:15:00',0),('f38c3d79-5d1f-476d-8d99-6c18e8498247','2fe41e6a-d85d-476c-82bd-653805197683','2025-11-19 08:45:00','2025-11-19 09:00:00',0),('f40b3560-518b-4d7a-a5eb-ea8f0e51432c','2f92ea51-032a-4c94-bd25-6796a872e5c6','2025-10-31 08:41:00','2025-10-31 08:50:00',1),('f67494c9-2e28-41cd-82a6-410eeb86c852','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 13:00:00','2025-11-23 13:15:00',1),('f72160c9-4924-44da-bde6-f00027d28eb6','79444174-ec25-456c-a888-b4c19f3b4e16','2025-11-08 22:30:00','2025-11-08 22:45:00',0),('f7c4ef9b-1fc5-4544-b372-57ff161ccc84','d7a55082-e3f4-4de6-abb2-c4b5279988aa','2025-12-02 20:45:00','2025-12-02 21:00:00',0),('f99c5c86-ea92-4fb4-8d0d-5371dc47cca7','48d7de46-0323-484d-a1bd-e982ff7a9ddc','2025-11-13 08:15:00','2025-11-13 08:30:00',0),('fa6b6c87-073f-43ea-9616-250f21524bf9','356eead6-c311-4652-a8f1-59b6f4ed831e','2025-11-14 10:00:00','2025-11-14 10:15:00',0),('fbd54644-cf63-4d22-af91-5e05186dd57a','80ab51b9-1f16-4ebb-91ee-dec533eada9b','2025-11-24 18:45:00','2025-11-24 19:00:00',0),('fd960d44-c3fc-45ed-8b79-db13dd463d4c','f915972b-eeef-441d-8e66-862122e93870','2025-11-25 21:15:00','2025-11-25 21:30:00',0),('fdc0ad1f-3ec3-4cf6-aea6-7103f3c0e910','3fb757fc-801f-4112-bce0-447953189ebc','2025-11-28 19:45:00','2025-11-28 20:00:00',0),('ff230451-b340-402d-a7f4-6c16e92a12dd','6480d74d-4579-4888-8629-7ed659322a68','2025-11-23 16:45:00','2025-11-23 17:00:00',0);
/*!40000 ALTER TABLE `work_schedule_detail` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 21:45:14

