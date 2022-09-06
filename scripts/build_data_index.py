import json
from datetime import datetime
from glob import glob
import os
import sys
import logging
from logging import info, warning, INFO
from os.path import join, basename, isfile, isdir

logging.basicConfig(level=INFO)


def list_unique_files(dataset_path):
    unique_files = set()
    for f in os.scandir(dataset_path):
        if f.is_dir:
            for file in glob(f"{f.path}/*"):
                unique_files.add(basename(file))
    return list(sorted(unique_files))


def json_read(filepath):
    with open(filepath, "r") as f:
        return json.load(f)


def find(name, iterable, predicate):
    results = list(filter(predicate, iterable))
    if len(results) == 0:
        warning(f"No entries found: {name}")
        return None
    if len(results) > 1:
        warning(f"More than one entry found for species: {name}")
        return None
    return results[0]


def find_downloads_table_entry(all_downloads_table, species_id):
    return find(
        f"find_downloads_table_entry: {species_id}",
        all_downloads_table["data"],
        lambda entry: entry["panX link"] == species_id
    )


def find_species_friendly_name(species_list_info, species_id):
    entry = find(
        f"find_species_friendly_name_entry: {species_id}",
        species_list_info["species_search_dt"],
        lambda entry: entry["linkName"] == species_id
    )

    if entry is not None:
        return entry["species"]

    return species_id


def find_species_category(species_list_info, species_id):
    for key, value in species_list_info["species_dt"].items():
        if "label" in value and "members" in value:
            if species_id in value["members"]:
                return value["label"].rstrip(":")
    warning(f"find_species_category: category not found for species: {species_id}")
    return None


def find_species_description(species_list_info, species_id):
    if species_id in species_list_info["species_dt"]:
        return species_list_info["species_dt"][species_id]
    warning(f"find_species_description: description not found for species: {species_id}")
    return species_id


def find_species_info_entry(species_list_info, species_id):
    name = find_species_friendly_name(species_list_info, species_id)
    category = find_species_category(species_list_info, species_id)
    description = find_species_description(species_list_info, species_id)
    return category, {"name": name, "description": description}


def generate_index_entry(dataset_path, species_dir_path, all_downloads_table, species_list_info):
    id = basename(species_dir_path)
    table_entry = find_downloads_table_entry(all_downloads_table, id)
    category, species_info = find_species_info_entry(species_list_info, id)

    if table_entry is not None:
        assert id == table_entry["panX link"]
        assert species_info["name"] == table_entry["species name"]
        species_info.update({
            "num_strains": table_entry["#strains"],
            "source": table_entry["source"],
            "downloads": {
                "gene cluster json": table_entry["gene cluster json"],
                "metadata table": table_entry["metadata table"],
                "strain/species tree": table_entry["strain/species tree"],
                "all gene alignments": table_entry["all gene alignments"],
                "core gene alignments": table_entry["core gene alignments"],
            },
        })
    else:
        warning(f"table entry is empty for species '{id}'")

    return category, {"id": id, **species_info}


def generate_index_json(dataset_path):
    all_downloads_table = json_read(join(dataset_path, "..", "all_downloads_table.json"))
    species_list_info = json_read(join(dataset_path, "..", "species_list_info.json"))
    case_studies = []
    orders = []
    records = []
    for f in os.scandir(dataset_path):
        if f.is_dir:
            category, entry = generate_index_entry(dataset_path, f.path, all_downloads_table, species_list_info)

            if category == "Case studies":
                case_studies.append(entry)
            if category == "Orders":
                orders.append(entry)
            if category == "Pan-genomes from RefSeq records":
                records.append(entry)

    index_json = {
        "created_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "case_studies": sorted(case_studies, key=lambda dataset: dataset["id"]),
        "orders": sorted(orders, key=lambda dataset: dataset["id"]),
        "records": sorted(records, key=lambda dataset: dataset["id"]),
    }

    index_json_path = join(dataset_path, "..", "index_v2.json")
    with open(index_json_path, "w") as f:
        json.dump(index_json, f, indent=2, sort_keys=False)

    info(f"Index written to '{index_json_path}'")


def generate_page_404(dataset_path):
    not_found_json_path = join(dataset_path, "..", "not_found.json")
    not_found_json = {"status": 404, "message": "Not found"}
    with open(not_found_json_path, "w") as f:
        json.dump(not_found_json, f, indent=2, sort_keys=False)


if __name__ == '__main__':
    data_root = sys.argv[1]
    dataset_path = join(sys.argv[1], "dataset")

    if not isdir(dataset_path):
        raise NotADirectoryError(f"Data root ('{data_root}') should contain directory 'dataset', but it was not found")

    info("Unique filenames across datasets: ")
    for file in list_unique_files(dataset_path):
        info(f"  {file}")

    info("-----")

    generate_index_json(dataset_path)
    generate_page_404(dataset_path)
