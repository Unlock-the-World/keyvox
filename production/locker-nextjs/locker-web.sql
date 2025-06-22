-- --------------------------------------------------------
-- 主机:                           192.168.32.31
-- 服务器版本:                        8.0.26 - MySQL Community Server - GPL
-- 服务器操作系统:                      Linux
-- HeidiSQL 版本:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 导出 locker-web 的数据库结构
CREATE DATABASE IF NOT EXISTS `locker-web` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `locker-web`;

-- 导出  表 locker-web.locker_order 结构
CREATE TABLE IF NOT EXISTS `locker_order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '订单id',
  `device_id` varchar(45) DEFAULT NULL,
  `device_name` varchar(128) DEFAULT NULL COMMENT '设备名称',
  `box_num` varchar(64) DEFAULT NULL COMMENT '箱格号',
  `box_name` varchar(64) DEFAULT NULL COMMENT '箱格名称',
  `box_size` varchar(12) DEFAULT NULL COMMENT '箱格尺寸',
  `pin_id` varchar(45) DEFAULT NULL COMMENT '密码id',
  `pin_code` varchar(45) DEFAULT NULL COMMENT '箱子密码',
  `s_time` varchar(45) DEFAULT NULL COMMENT '箱子使用开始时间',
  `e_time` varchar(45) DEFAULT NULL COMMENT '箱子使用结束时间',
  `payment_status` char(1) DEFAULT '0' COMMENT '支付状态：  0 未支付',
  `order_amount` varchar(45) DEFAULT NULL COMMENT '订单金额',
  `paid_amount` varchar(45) DEFAULT NULL COMMENT '已经支付金额',
  `user_id` varchar(45) NOT NULL COMMENT '用户id, 主要存手机号',
  `qr_code` varchar(256) DEFAULT NULL,
  `box_mode` char(1) DEFAULT NULL,
  `days` int DEFAULT NULL,
  `status` char(1) DEFAULT '0' COMMENT 'status:  0：正常   1：删除   2：取消',
  PRIMARY KEY (`id`),
  UNIQUE KEY `pin_id_UNIQUE` (`pin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=279 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 数据导出被取消选择。

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
