package main;

import org.apache.hadoop.util.Time;
import org.apache.spark.SparkConf;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.elasticsearch.spark.sql.api.java.JavaEsSparkSQL;

import beans.ArgumentBean;
import beans.datamanager.ArgumentBeanDataManager;
import constants.DatasetConstants.ElastichsearchFields;
import dataAnalytics.ModelManager;

public class Main {

	public static void main(String[] args) {
			
		ArgumentBeanDataManager argDM = new ArgumentBeanDataManager();
		ArgumentBean argBean= argDM.getInfo(args);
		
		if(argDM.checkArgs(argBean)){
			exec(argBean);
		}
		else System.out.println();
	}
	
	public static void exec(ArgumentBean argBean){
		
		long nanosInHour = 3600000000000l;
		long nanosInMilli = 1000000l;
		
		try{
		
			//Setting up Elasticsearch configuration
			SparkConf conf = new SparkConf(true)
					.set("spark.cleaner.ttl", "3600")
					.set("es.nodes", argBean.getEsIP())
					.set("es.port", argBean.getEsPort())
					.set("es.nodes.discovery", "false")
					.set("es.nodes.wan.only", "true")
					.set("es.index.auto.create", "true");
			
			// Creating SparkSession
			SparkSession spark = SparkSession
					.builder()
					.master("local[*]")
					.config(conf)
					.getOrCreate();
			
			String esQuery = "?q=" + ElastichsearchFields.TIMESTAMP.getValue() + ":>" 
					+ ((Time.now()*nanosInMilli) - (argBean.getHoursData()*nanosInHour));
			
			//Collecting data from Elasticsearch
			Dataset<Row> dataset = JavaEsSparkSQL
					.esDF(
							spark.sqlContext(), 
							argBean.getIndex(),
							esQuery
					);
			
			/*
			 * Setting up algorithm
			 * Executing algorithm, obtaining predictive model
			 * Obtaining predicitions using ML model
			 */
			dataset = ModelManager
					.getModelManager(spark)
					.loadAlgorithm(argBean.getAlgorithm())
					.run(dataset, argBean.getHoursPredicted());
			
			//Sending predictions to Kafka
			dataset.selectExpr("CAST(key AS STRING)", "CAST(value AS STRING)")
			  .write()
			  .format("kafka")
			  .option("kafka.bootstrap.servers", argBean.getKafkaAddress())
			  .option("topic", argBean.getTopic())
			  .save();
			
			spark.stop();

		}catch(Exception ex){
			ex.printStackTrace();
		}
	}

}
