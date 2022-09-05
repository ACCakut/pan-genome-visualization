from datetime import datetime
from glob import glob
from itertools import zip_longest
from logging import info, warning, INFO
from os.path import join, basename, isfile, isdir, dirname
from os import makedirs
import json
import logging
import os
import sys
import tarfile

logging.basicConfig(level=INFO)

BATCH_SIZE = 50  # Number of gene clusters packaged in one archive. This might need some tuning.


# Splits an iterable into a tuples of size n
# https://stackoverflow.com/a/312644
def grouper(n, iterable, padvalue=None):
    "grouper(3, 'abcdefg', 'x') --> ('a','b','c'), ('d','e','f'), ('g','x','x')"
    return zip_longest(*[iter(iterable)] * n, fillvalue=padvalue)


def tar_add(tar, filepath):
    if not isfile(filepath):
        return None

    arcname = basename(filepath)
    tar.add(filepath, arcname=arcname)

    return arcname


def tar_add_files(tar, gene_cluster_dir_path, gene_cluster_name):
    return {
        "aa_aln": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_aa_aln.fa")),
        "aa_aln_reduced": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_aa_aln_reduced.fa")),
        "na_aln": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_na_aln.fa")),
        "na_aln_reduced": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_na_aln_reduced.fa")),
        "nwk": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}.nwk")),
        "patterns_json": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_patterns.json")),
        "tree_json": tar_add(tar, join(gene_cluster_dir_path, f"{gene_cluster_name}_tree.json")),
    }


def generate_archives_for_species(dataset_path, species_name):
    species_dir_path = join(dataset_path, species_name)
    gene_cluster_dir_path = join(species_dir_path, "geneCluster")
    gene_cluster_json_path = join(species_dir_path, "geneCluster.json")

    with open(gene_cluster_json_path, "r") as f:
        gene_cluster_json = json.load(f)

    clusters = []

    for i, gene_cluster_group in enumerate(grouper(BATCH_SIZE, gene_cluster_json)):
        archive_path_rel = join("gene_cluster_archives", f"{i:07d}.tar")
        archive_path = join(species_dir_path, archive_path_rel)
        makedirs(dirname(archive_path), exist_ok=True)

        with tarfile.open(archive_path, "w") as tar:
            for gene_cluster in gene_cluster_group:
                if gene_cluster is not None:
                    gene_cluster_name = gene_cluster["msa"]

                    add_files_result = tar_add_files(tar, gene_cluster_dir_path, gene_cluster_name)

                    clusters.append({
                        **gene_cluster,
                        "archive": archive_path_rel,
                        "archive_files": add_files_result,
                    })

    gene_cluster_v2_json = {
        "created_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "clusters": clusters
    }

    gene_cluster_v2_json_path = join(species_dir_path, "gene_cluster_v2.json")
    with open(gene_cluster_v2_json_path, "w") as f:
        json.dump(gene_cluster_v2_json, f, indent=2, sort_keys=False)


def generate_all_archives(data_root):
    dataset_path = join(data_root, "dataset")
    index_json_path = join(data_root, "index.json")

    if not isdir(dataset_path):
        raise NotADirectoryError(f"Data root ('{data_root}') should contain directory 'dataset', but it was not found")

    if not isfile(index_json_path):
        raise FileNotFoundError(f"Data root ('{data_root}') should contain file 'index.json', but it was not found")

    with open(index_json_path, "r") as f:
        index_json = json.load(f)

    for dataset in index_json["datasets"]:
        species_name = dataset["pathogenName"]
        generate_archives_for_species(dataset_path, species_name)


if __name__ == '__main__':
    data_root = sys.argv[1]
    generate_all_archives(data_root)
