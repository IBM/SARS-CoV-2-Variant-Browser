import csv
import sys
import os
import pandas as pd
import numpy as np
import json
import traceback
import datetime

# -*- coding: utf-8 -*-
"""This tool creates tables for displaying COVID-19 stat views 
   By providing the Input folder as below, the following types of output file will be created.

   Format：python Stat_View_Table_Process.py {version} {dataset}
   ex： python Stat_View_Table_Process.py r18 Full

"""

#----------------------------------------------------------------------------------------------------------
# check file 
def fileCheck(fn):
    try:
      open(fn, "r")
      return 1
    except IOError:
      print("Error: File "+ fn + " does not appear to exist.")
      return 0

#----------------------------------------------------------------------------------------------------------
def dateProcess(data):
    data['Geo_Country'] = data['Geo_Country'].fillna('unknown')   
    data['Geo_Region'] = data['Geo_Region'].fillna('unknown')
    data['Geo_City'] = data['Geo_City'].fillna('unknown')
    data['date'] = pd.to_datetime(data['Collection_Date'])
    #add column for processing monthly data
    data['YearMonth'] = data['date'].dt.strftime('%Y/%m') 
    #add column for processing daily data
    data['YearMonthDay'] = data['date'].dt.strftime('%Y/%m/%d') 
    #add column for processing weekly data (Sunday based)
    data['Weekday'] = data['date'].dt.dayofweek
    data['Week'] = (data['date'] - pd.to_timedelta(data['Weekday'] - 6,unit='d')).dt.strftime('%Y/%m/%d')
    #add cloum for counting
    data['count'] = 1

    return data
    
#----------------------------------------------------------------------------------------------------------
def createDateColumns(start,end,period):

    if (period == 'YearMonth'):
        column = pd.date_range(start = start , end = end, freq ='MS').strftime('%Y/%m')
    elif (period == 'YearMonthDay'):
        column = pd.date_range(start = start , end = end, freq ='D').strftime('%Y/%m/%d')
    elif (period == 'Week'):
        column = pd.date_range(start = start , end = end, freq ='W').strftime('%Y/%m/%d')      
    tempdata = pd.DataFrame(columns = column )

    return tempdata


#----------------------------------------------------------------------------------------------------------

# get unified list and count for each item in specific column from data
#   data = mergedVariantData, mergedCladeData
#   selectRange = {'Geo_Region', 'Geo_Country' }
#   index = {'Mutation', 'Type'} 
#   period = {'YearMonth','YearMonthDay', 'Week'} 

def processTargetCountByPeriod(data, selectRange, index, period):   
    # get uniqued country/continent List for looping
    itemList = data[selectRange].unique()   
    itemList.sort(axis=0) 
    
    mergedCountResult = createDateColumns(data[period].min(),data[period].max(), period )
    mergedColumn = pd.DataFrame()

    # get time series count table for certain country/continent and merge all the result
    for item in itemList:
        # extract data of certain country/continent
        tempList = data[selectRange] == item
        tempData = data[tempList]
        # get time series count table
        tempCountResult = pd.pivot_table(tempData , values='count', index=index, columns=period, aggfunc='count', fill_value=0 )
        # merge result
        mergedCountResult = pd.concat([mergedCountResult, tempCountResult], sort=True)
        # create country/continent column
        tempColumn = pd.DataFrame(index=range(len(tempCountResult)))
        tempColumn[selectRange] = item
        mergedColumn = pd.concat([mergedColumn, tempColumn], sort=True)

    # insert index name into data
    mergedCountResult.insert(0, index, mergedCountResult.index)
    # reset index for merging
    mergedCountResult = mergedCountResult.reset_index(drop=True)
    mergedColumn = mergedColumn.reset_index(drop=True)
    # insert country/continent column into data
    mergedCountResult.insert(0, selectRange, mergedColumn)
    # fill NA with 0
    mergedCountResult = mergedCountResult.fillna('0') 

    return mergedCountResult

#----------------------------------------------------------------------------------------------------------

if __name__ == '__main__':
   #

    args = sys.argv
    if len(args) < 3:
        print('Syntax error')
        sys.exit(1)

    version = args[1]
    dataset = args[2]

    inputFolder = os.path.join(os.getcwd(),"data",version,dataset )#".\\data" + os.path.sep + version + os.path.sep + dataset
    outputFolder = os.path.join(os.getcwd(),"data",version,"Stat-"+dataset )#".\\data" + os.path.sep + version + os.path.sep + dataset
    
    sampleFilePath = inputFolder + os.path.sep + "samples_" + version + "_" +dataset + ".tsv"
    variantFilePath = inputFolder + os.path.sep + "variant_" + version + "_" +dataset + ".tsv"
    cladeFilePath = inputFolder + os.path.sep + "clade_" + version + "_" +dataset + ".tsv"

    # Check if files exist or not
    if (fileCheck(sampleFilePath) == 0):
        sys.exit(1)
    if (fileCheck(variantFilePath) == 0):
        sys.exit(1)
    if (fileCheck(cladeFilePath) == 0):
        sys.exit(1)

    sampleData =  pd.read_csv(sampleFilePath, delimiter ='\t')
    variantData =  pd.read_csv(variantFilePath, delimiter ='\t')
    cladeData =  pd.read_csv(cladeFilePath, delimiter ='\t')

    # Make output folder
    os.makedirs(outputFolder, exist_ok=True)

    # Data pre-process
    sampleData = sampleData.rename(columns={'sample':'Sample'})
    sampleData = dateProcess(sampleData)

    mergedVariantData = pd.merge(variantData, sampleData, how='left', on ='Sample')
    mergedVariantData = mergedVariantData.fillna('unknown')
    mergedCladeData = pd.merge(cladeData, sampleData, how='left', on ='Sample')
    mergedCladeData = mergedCladeData.fillna('unknown')

    # No.0 Stat view:  Basic info
    try:
        print("---------- Processing: No.0 Stat view ---------- ")

        basicInfo = pd.DataFrame()
        basicInfo = basicInfo.append(pd.Series(['Analyzed Date', datetime.datetime.now()]),ignore_index=True)
        basicInfo = basicInfo.append(pd.Series(['Latest Collention Date', sampleData['Collection_Date'].max()]),ignore_index=True)
        basicInfo = basicInfo.append(pd.Series(['Total Sample Number', len(sampleData)]),ignore_index=True)
        basicInfo = basicInfo.append(pd.Series(['Total Variant Number', len(variantData['Mutation'].unique())]),ignore_index=True)

        fileName = '00_basic_infomaction_'+version+'_'+dataset+'.csv'
        basicInfo.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.0 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.0 Stat view ")
        traceback.print_exc()

    # No.16 Stat view:  Mutation variant in each Gene
    try:
        print("---------- Processing: No.16 Stat view ---------- ")

        selectRange = 'Gene'
        index = 'Mutation'
        period = 'YearMonth'
        mergedVariantCountByMonth = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '00_gene_variant_'+version+'_'+dataset+'.csv'
        mergedVariantCountByMonth[[selectRange,index]].to_csv(outputFolder + os.path.sep + fileName, index=False)
        print("---------- Done: No.16 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.16 Stat view ")
        traceback.print_exc()

    # No.17 Stat view:  Mutation variant in sub gene of ORF1ab
    try:
        print("---------- Processing: No.17 Stat view ---------- ")
        selectGene = 'ORF1ab'
        selectRange = 'Protein'
        index = 'Mutation'
        period = 'YearMonth'

        selectGeneList = mergedVariantData['Gene'] == selectGene
        selectGeneData = mergedVariantData[selectGeneList]
        
        mergedVariantCountEachSubGeneByMonth = processTargetCountByPeriod(selectGeneData, selectRange, index, period)
        fileName = '00_' + selectGene + '_sub_variant_'+version+'_'+dataset+'.csv'
        mergedVariantCountEachSubGeneByMonth[[selectRange,index]].to_csv(outputFolder + os.path.sep + fileName, index=False)
        print("---------- Done: No.17 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.17 Stat view ")
        traceback.print_exc()

        selectRange = 'Geo_Region'
        index = 'Mutation'
        period = 'YearMonth'
        mergedVariantCountByMonth = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '03_continent_variants_month_'+version+'_'+dataset+'.csv'
        mergedVariantCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.5 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.5 Stat view ")
        traceback.print_exc()
        
    # No.1 Stat view:  Count of each continent
    try:
        print("---------- Processing: No.1 Stat view ---------- ")

        index = 'Geo_Region'
        continentCount = sampleData[index].value_counts().sort_index()
        continentCount = continentCount.to_frame('count')
        continentCount.insert(0, index, continentCount.index)
        fileName = '01_continent_samples_'+version+'_'+dataset+'.csv'
        continentCount.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.1 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.1 Stat view ")
        traceback.print_exc()

    # No.2 Stat view data:  Count of each country
    try:
        print("---------- Processing: No.2 Stat view ---------- ")

        index = 'Geo_Country'
        countryCount = sampleData[index].value_counts().sort_index()
        countryCount = countryCount.to_frame('count')
        countryCount.insert(0, index, countryCount.index)
        header =['count']
        fileName = '01_country_samples_'+version+'_'+dataset+'.csv'
        countryCount.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.2 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.2 Stat view ")
        traceback.print_exc()

    # No.18 Stat view data:  Count of each city
    try:
        print("---------- Processing: No.18 Stat view ---------- ")

        index = 'Geo_City'
        countryCount = sampleData[index].value_counts().sort_index()
        countryCount = countryCount.to_frame('count')
        countryCount.insert(0, index, countryCount.index)
        header =['count']
        fileName = '01_city_samples_'+version+'_'+dataset+'.csv'
        countryCount.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.18 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.18 Stat view ")
        traceback.print_exc()

    # No.3 Stat view data:   Count of each continent by month
    try:
        print("---------- Processing: No.3 Stat view ---------- ")

        index = 'Geo_Region'
        period = 'YearMonth'
        continentCountByMonth = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempContinentCountByMonth = pd.pivot_table(sampleData, values='count', index=index , columns=period, aggfunc='count', fill_value=0 )
        continentCountByMonth = pd.concat([continentCountByMonth, tempContinentCountByMonth], sort=True)
        continentCountByMonth = continentCountByMonth.fillna('0') 
        continentCountByMonth.insert(0, index, continentCountByMonth.index)
        fileName = '02_continent_samples_collection_month_'+version+'_'+dataset+'.csv'
        continentCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.3 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.3 Stat view ")
        traceback.print_exc()

    # No.4 Stat view data:   Count of each country by month
    try:
        print("---------- Processing: No.4 Stat view ---------- ")

        index = 'Geo_Country'
        period = 'YearMonth'
        countryCountByMonth = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempCountryCountByMonth = pd.pivot_table(sampleData, values = 'count', index=index , columns=period, aggfunc='count', fill_value=0 )
        countryCountByMonth = pd.concat([countryCountByMonth, tempCountryCountByMonth], sort=True)
        countryCountByMonth = countryCountByMonth.fillna('0') 
        countryCountByMonth.insert(0, index, countryCountByMonth.index)
        fileName = '02_country_samples_collection_month_'+version+'_'+dataset+'.csv'
        countryCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.4 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.4 Stat view ")
        traceback.print_exc()

    # No.19 Stat view data:   Count of each city by month
    try:
        print("---------- Processing: No.19 Stat view ---------- ")

        index = 'Geo_City'
        period = 'YearMonth'
        countryCountByMonth = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempCountryCountByMonth = pd.pivot_table(sampleData, values = 'count', index=index , columns=period, aggfunc='count', fill_value=0 )
        countryCountByMonth = pd.concat([countryCountByMonth, tempCountryCountByMonth], sort=True)
        countryCountByMonth = countryCountByMonth.fillna('0') 
        countryCountByMonth.insert(0, index, countryCountByMonth.index)
        fileName = '02_city_samples_collection_month_'+version+'_'+dataset+'.csv'
        countryCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.19 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.19 Stat view ")
        traceback.print_exc()

    # No.5 Stat view data:   Variant count of each continent by month
    try:
        print("---------- Processing: No.5 Stat view ---------- ")

        selectRange = 'Geo_Region'
        index = 'Mutation'
        period = 'YearMonth'
        mergedVariantCountByMonth = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '03_continent_variants_month_'+version+'_'+dataset+'.csv'
        mergedVariantCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.5 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.5 Stat view ")
        traceback.print_exc()


    # No.6 Stat view data:   Variant count of each country by month
    try:
        print("---------- Processing: No.6 Stat view ---------- ")

        selectRange = 'Geo_Country'
        index = 'Mutation'
        period = 'YearMonth'
        mergedVariantCountByMonth = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '03_country_variants_month_'+version+'_'+dataset+'.csv'
        mergedVariantCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.6 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.6 Stat view ")
        traceback.print_exc()

    # No.23 Stat view data:   Variant count of each city by month
    try:
        print("---------- Processing: No.23 Stat view ---------- ")

        selectRange = 'Geo_City'
        index = 'Mutation'
        period = 'YearMonth'
        mergedVariantCountByMonth = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '03_city_variants_month_'+version+'_'+dataset+'.csv'
        mergedVariantCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.23 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.23 Stat view ")
        traceback.print_exc()

    # No.7 Stat view data:   Clade count of each continent by month
    try:    
        print("---------- Processing: No.7 Stat view ---------- ")

        selectRange = 'Geo_Region'
        index = 'Detail'
        period = 'YearMonth'
        mergedCladeCountByMonth = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '04_continent_clade_month_'+version+'_'+dataset+'.csv'
        mergedCladeCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.7 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.7 Stat view ")
        traceback.print_exc()

    # No.8 Stat view data:   Clade count of each country by month
    try: 
        print("---------- Processing: No.8 Stat view ---------- ")

        selectRange = 'Geo_Country'
        index = 'Detail'
        period = 'YearMonth'
        mergedCladeCountByMonth = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '04_country_clade_month_'+version+'_'+dataset+'.csv'
        mergedCladeCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.8 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.8 Stat view ")
        traceback.print_exc()

    # No.22 Stat view data:   Clade count of each city by month
    try: 
        print("---------- Processing: No.22 Stat view ---------- ")

        selectRange = 'Geo_City'
        index = 'Detail'
        period = 'YearMonth'
        mergedCladeCountByMonth = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '04_city_clade_month_'+version+'_'+dataset+'.csv'
        mergedCladeCountByMonth.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.22 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.22 Stat view ")
        traceback.print_exc()

    # No.9 Stat view data:   Count of each continent by week
    try: 
        print("---------- Processing: No.9 Stat view ---------- ")

        index = 'Geo_Region'
        period = 'Week'
        continentCountByWeek = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempContinentCountByWeek = pd.pivot_table(sampleData, values = 'count', index =index , columns =period, aggfunc ='count', fill_value=0 )
        continentCountByWeek = pd.concat([continentCountByWeek, tempContinentCountByWeek], sort=True)
        continentCountByWeek = continentCountByWeek.fillna('0') 
        continentCountByWeek.insert(0, index, continentCountByWeek.index)
        fileName = '05_continent_samples_collection_week_'+version+'_'+dataset+'.csv'
        continentCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.9 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.9 Stat view ")
        traceback.print_exc()

    # No.10 Stat view data:   Count of each country by week
    try: 
        print("---------- Processing: No.10 Stat view ---------- ")

        index = 'Geo_Country'
        period = 'Week'
        countryCountByWeek = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempCountryCountByWeek = pd.pivot_table(sampleData, values = 'count', index =index , columns =period, aggfunc ='count', fill_value=0 )
        countryCountByWeek = pd.concat([countryCountByWeek, tempCountryCountByWeek], sort=True)
        countryCountByWeek = countryCountByWeek.fillna('0') 
        countryCountByWeek.insert(0, index, countryCountByWeek.index)
        fileName = '05_country_samples_collection_week_'+version+'_'+dataset+'.csv'
        countryCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.10 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.10 Stat view ")
        traceback.print_exc()

    # No.20 Stat view data:   Count of each city by week
    try: 
        print("---------- Processing: No.20 Stat view ---------- ")

        index = 'Geo_City'
        period = 'Week'
        countryCountByWeek = createDateColumns(sampleData[period].min(),sampleData[period].max(), period )
        tempCountryCountByWeek = pd.pivot_table(sampleData, values = 'count', index =index , columns =period, aggfunc ='count', fill_value=0 )
        countryCountByWeek = pd.concat([countryCountByWeek, tempCountryCountByWeek], sort=True)
        countryCountByWeek = countryCountByWeek.fillna('0') 
        countryCountByWeek.insert(0, index, countryCountByWeek.index)
        fileName = '05_city_samples_collection_week_'+version+'_'+dataset+'.csv'
        countryCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.20 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.20 Stat view ")
        traceback.print_exc()

    # No.11 Stat view data:   Variant count of each continent by week
    try: 
        print("---------- Processing: No.11 Stat view ---------- ")

        selectRange = 'Geo_Region'
        index = 'Mutation'
        period = 'Week'
        mergedVariantCountByWeek = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '06_continent_variants_week_'+version+'_'+dataset+'.csv'
        mergedVariantCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.11 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.11 Stat view ")
        traceback.print_exc()

    # No.12 Stat view data:   Variant count of each country by week
    try:  
        print("---------- Processing: No.12 Stat view ---------- ")

        selectRange = 'Geo_Country'
        index = 'Mutation'
        period = 'Week'
        mergedVariantCountByWeek = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '06_country_variants_week_'+version+'_'+dataset+'.csv'
        mergedVariantCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.12 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.12 Stat view ")
        traceback.print_exc()

    # No.21 Stat view data:   Variant count of each city by week
    try:  
        print("---------- Processing: No.21 Stat view ---------- ")

        selectRange = 'Geo_City'
        index = 'Mutation'
        period = 'Week'
        mergedVariantCountByWeek = processTargetCountByPeriod(mergedVariantData, selectRange, index, period)
        fileName = '06_city_variants_week_'+version+'_'+dataset+'.csv'
        mergedVariantCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.21 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.21 Stat view ")
        traceback.print_exc()

    # No.13 Stat view data:   Clade count of each continent by week
    try: 
        print("---------- Processing: No.13 Stat view ---------- ")

        selectRange = 'Geo_Region'
        index = 'Detail'
        period = 'Week'
        mergedCladeCountByWeek = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '07_continent_clade_week_'+version+'_'+dataset+'.csv'
        mergedCladeCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.13 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.13 Stat view ")
        traceback.print_exc()

    # No.14 Stat view data:   Clade count of in each country by week
    try: 
        print("---------- Processing: No.14 Stat view ---------- ")

        selectRange = 'Geo_Country'
        index = 'Detail'
        period = 'Week'
        mergedCladeCountByWeek = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '07_country_clade_week_'+version+'_'+dataset+'.csv'
        mergedCladeCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.14 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.14 Stat view ")
        traceback.print_exc()

    # No.15 Stat view data:   Clade count of in each city by week
    try: 
        print("---------- Processing: No.15 Stat view ---------- ")

        selectRange = 'Geo_City'
        index = 'Detail'
        period = 'Week'
        mergedCladeCountByWeek = processTargetCountByPeriod(mergedCladeData, selectRange, index, period)
        fileName = '07_city_clade_week_'+version+'_'+dataset+'.csv'
        mergedCladeCountByWeek.to_csv(outputFolder + os.path.sep + fileName, index=False)

        print("---------- Done: No.15 Stat view ---------- ")
    except Exception as e:
        print("Process error: No.15 Stat view ")
        traceback.print_exc()

