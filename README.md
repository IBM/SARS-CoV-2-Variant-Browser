# SARS-CoV-2 Variant Browser
The SARS-CoV-2 Variant Browser is a web based application to explore and visualize SARS-CoV-2 variants, apply spatial, temporal and molecular filters, and view data statistics in an easy-to-use graphical interface.


## Prerequiste
- `Node.js` is required to prepare data and launch application server.
- `Python3` is required to prepare data.


## Getting Started
First, clone project, install dependencies and build application with the following commands:

```bash
git clone https://github.com/IBM/SARS-CoV-2-Variant-Browser
cd SARS-CoV-2-Variant-Browser
npm install
npm run build
```


## Prepare Data
Before exploring variant data with application, data preparation is necessary.

We introduce two properties `version` and `dataset` to manage data version and data set in folder and file names. Please follow the naming conventions to create foloder and files in each steps.

1. Obtain or create raw data

    You can obtain sample raw data files from [here](https://ibm.ent.box.com/s/7dhngud59qur8b8vkwznh7k7wyihidwe).
    Put raw data files in the following structures:
    ```
    <data folder(default is ./data)>
    |-- <version>
        |-- <dataset>
            |-- clade_<version>_<dataset>.tsv
            |-- cluster_<version>_<dataset>.tsv
            |-- samples_<version>_<dataset>.tsv
            |-- variant_<version>_<dataset>.tsv
        |-- locations_<version>.csv
    ```
1. Create stat data from raw data

    Run the following command to generate stat files. Please note that the script requires numpy and pandas.
    ```bash
    python ./tools/StatViewTableProcess/Stat_View_Table_Process.py <version> <dataset>
    ```
    Stat data will be generated in the following structures:
    ```
    <data folder(default is ./data)>
    |-- <version>
        |-- Stat-<dataset>
          |-- 00_basic_infomation_<version>_<dataset>.csv
          |-- 00_gene_variant_<version>_<dataset>.csv
          |-- ...
          |-- 07_country_clade_week_<version>_<dataset>.csv
    ```

1. Create JSON data files from raw and stat data:

    Modify DATA_VERSION and DATA_SET environment variables in `.env` file to specify `version` and `dataset`,
    and run the following command to generate JSON data.
    ```bash
    npm run update-data variant
    ```
    Or you can specify environment variables directly in the command line:
    ```bash
    DATA_VERSION=r42 DATA_SET=NCBI npm run update-data variant
    ```
    JSON data to be used in the application will be generated in `./data/json` folder.

## Run Application

Start server with the following command:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Note that modify DEFAULT_DATA_SET environment variables in `.env` file to specify `dataset`.


## Run Application in Development Mode

You can run the development server if you need to modify code for your own enhancement:

```bash
npm run dev
```


## License

The SARS-CoV-2 Variant Browser is licensed under the Apache Software License, Version 2.
The license's full text can be found in [LICENSE](LICENSE).

