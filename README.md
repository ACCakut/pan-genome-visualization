# Pan-genome analysis and visualization

Even closely related bacterial genomes can differ in the presence of hundreds of genes and individual genes can be horizontally acquired from distant strains and species.
This mix of inheritance patterns complicates phylogenetic analysis of bacteria.

Although several software packages are available for pan-genome analysis, yet visualization, interpretation and exploration of pan-genomes remains challenging.
**panX
** (Pan-genome Analysis and Exploration) aims at facilitating pan-genome research with an easy-to-use and interactive platform for analyzing and exploring pan-genomic data.

panX displays the pan-genome using interconnected visual components including gene cluster table, multiple alignment, comparative phylogenetic tree viewers and strain metadata table. The pan-genome data structures are prepared by our [pan-genome-analysis](https://github.com/neherlab/pan-genome-analysis) analysis pipeline, which efficiently identifies orthologous clusters from large sets of genome sequences and pre-computes alignments, trees, and plenty of informative statistics.
**panX is available at [pangenome.org](https://pangenome.org)**

## Pipeline overview

![panX](/panX-pipeline.png)

panX analysis pipeline is based on DIAMOND, MCL and post-processing to determine clusters of orthologous genes from a collection of annotated genomes.
panX generates a strain/species tree based on core genome SNPs and a gene tree for each gene cluster.

**panX interactive visualization
**: (1) The dynamic pan-genome statistical charts allow rapid filtering and selection of gene subsets in cluster table;

clicking a gene cluster in cluster table loads (2) related alignment, (3) individual gene tree and (4) gene presence/absence and gain/loss pattern on strain/species tree;

(5) Selecting sequences in alignment highlights associated strains on strain/species tree;

(6) (7) Strain/species tree interacts with gene tree in various ways;

(8) Zooming into a clade on strain/species tree screens strains in metadata table;

(9) Searching in metadata table display strains pertinent to specific meta-information.

## Running locally with the default data

> NOTE: The project is currently undergoing a complete rewrite.
>
> The `master` branch currently contains legacy application written in vanilla JavaScript sometimes in 2015. It uses some very old libraries and techniques. And this is what you currently see on [pangenome.org](https://pangenome.org). It might be tricky to run. We tried to summarize how to run the application in the sections below.
>
> The new application will probably work differently, and once the implementation is completed, when it's moved to the `master` branch, it will likely break your current setup. So make sure you remember the git commit hash you are currently using, just in case you want to go back to it. The rewrite currently has low-to-medium priority compared to our other projects, so it might take a while to finish. You can track the progress in https://github.com/neherlab/pan-genome-visualization/pull/13


Steps:

- Install Node.js <= 10.x.y

  > Note, Node.js versions 11 and above are not supported due to legacy packages used in the implementation. Installing from the package manager of the operating system is discouraged. We recommend to install Node.js either with a direct download from the official website [[1](https://nodejs.org/en/download/)], [[2](https://nodejs.org/dist/)], or by using [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows). Don't forget to add the `bin` directory of the Node.js distribution to your `$PATH`.

  After installation is done, verify the correctness of the installation by printing versions:

   ```bash
   node --version
   # output: v10.x.y
   
   npm --version
   # output: 6.x.y
   ````

- Clone the repository and initialize submodules

   ```bash
   git clone https://github.com/neherlab/pan-genome-visualization
   cd pan-genome-visualization
   git submodule update --init
   ```

- Configure the build environment configuration, by copying the example configuration:

   ```bash
   cp .env.example .env
   ```

  The file `.env` should now contain some of the variables that control the build and behavior of the application.

- Install Node.js dependencies (they will appear in the directory `node_modules/`)

   ```bash
   npm install
   ```

- Build the application

   ```bash
   npm run build
   ```

  If you are receiving the error

  ```
  ReferenceError: primordials is not defined
  ```

  then you are likely running Node.js version that is imcompatible with the old packages the application is using. Try to install Node.js 10 or below.

- Start the local server:

   ```bash
   npm run start
   ```

  This will start a local web server on port `8000`

- Navigate to http://localhost:8000 in your browser

## Running locally with your own data

Notice the variable `DATA_ROOT_URL` in the `.env` file. It configures the URL to the input data (generated by the panX analysis pipeline).

By default, this variable points to the server hosted by the maintainers of panX. This is the same data that you see on https://pangenome.org.

You can change this variable to point to your own data - you will need a webserver either local or remote, to host the data. Make sure your server has [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) enabled.

Below is explained how to run the application locally. This section assumes you are able to succesfully run the application with the default data (see section above). There will be 2 web servers running at the same time: one to host the application itself (just like before), another to host the data.

- Gather your data, using the following directory structure:

   ```bash
   ├── dataset
   │   ├── Escherichia_coli
   │   │   ├── all_gene_alignments.zip
   │   │   ├── allclusters_final.tsv
   │   │   ├── coreGenomeTree.json
   │   │   ├── core_gene_alignments.zip
   │   │   ├── geneCluster
   │   │   │   ├── 001316641f4c392d_refined.nwk
   │   │   │   ├── 001316641f4c392d_refined_aa_aln.fa
   │   │   │   ├── 001316641f4c392d_refined_aa_aln_reduced.fa
   │   │   │   ├── 001316641f4c392d_refined_na_aln.fa
   │   │   │   ├── 001316641f4c392d_refined_na_aln_reduced.fa
   │   │   │   ├── ...
   │   │   ├── metaConfiguration.js
   │   │   ├── metainfo.tsv
   │   │   ├── strainMetainfo.json
   │   │   └── strain_tree.nwk
   │   ├── Pseudomonas_aeruginosa
   │   ├──...
   │   ├── Staphylococcus_aureus
   │   ├──...
   
   ```

  that is, there should be a top-level directory `dataset`. Inside, for each pathogen there should be a directory with the name of the pathogen, e.g. `Escherichia_coli` (it will become a part of the URL, so it is better to avoid spaces and special characters). Each pathogen directory should contain the output of the panX analysis pipeline.

- Start local webserver to host your data. For example, you could execute [`serve` NPM package](https://www.npmjs.com/package/serve) using [npx](https://www.npmjs.com/package/npx):

   ```bash
   npx serve --cors --listen=tcp://0.0.0.0:8001 path/to/your/data/directory
   ```

  Here, the `path/to/your/data/directory` is the directory that contains `dataset` directory that we prepared above and we are starting the server on port `8001`, and enabling CORS.

  You should now be able to access your raw data files in the browser directly:

   ````
   http://localhost:8001/dataset/Escherichia_coli/coreGenomeTree.json
   ````

- Open `.env` file and change the value of the variable `DATA_ROOT_URL`, to tell the application where to look for the data. In our case, we change it to:

   ```
   DATA_ROOT_URL=http://localhost:8001
   ```

- Rebuild the application as usual:

   ```bash
   npm run build
   ```

  Note, the changes to the `.env` file, as well as changes in data directory (i.e. when adding, removing or renaming the pathogens) are only picked up after rebuild.

- Start the local server:

   ```bash
   npm run start
   ```

- Navigate to http://localhost:8000 in your browser. Note that your data will not be available in the dropdown. However, you can navigate to the page of the pathogen by its name, for example http://localhost:8000/Escherichia_coli. In this case the app will fetch data from the server you specified, from its subdirectory `dataset/Escherichia_coli`.

- (Optional) If you want to change the dropdown items, then it's tricky. Currently, they are hardcoded in the file [/public/javascripts/species-list-info.js](https://github.com/neherlab/pan-genome-visualization/blob/08d876b526f273f7ee33bcc56a087f8938470ff9/public/javascripts/species-list-info.js). Modify the lists as you see fit and then rebuild and restart the application.

## Hosting your own copy of PanX on the internet

The build process produces all necessary files (except input data) in the directory `public/`.

The build is static and self-contained. To serve the application to the world, you can use any static webserver (e.g. Express, Apache or nginx), as well as any cloud service (e.g. AWS) or a web hosting (e.g. GitHub Pages). All you need is to put the `public/` directory into the root of your webserver.

Note that the data still has to be prepared and served independently. It can be served by a separate server or on the same server as the application. The `DATA_ROOT_URL` should be set correctly, so that the app can find the data.

In fact, this is exactly how https://pangenome.org works. The data and the app are both served on AWS S3 (different buckets), both via Cloudfront cache. The app is built by the GitHub Action and the `public/` directory is simply copied to S3 (see GitHub Action config in `.github/workflows/ci.yml`).

Similarly, the `npm run start` command just runs a local static web server (based on Express), which serves the `public/` directory.
