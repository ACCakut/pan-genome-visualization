#!/usr/bin/env bash
set -euo pipefail
trap "exit" INT

export INPUT_DIR="${1:? Pass input directory as first parameter}"

if [ ! -d "${INPUT_DIR}/dataset/" ]; then
  echo "Invalid input directory: '${INPUT_DIR}'. Input directory should contain subdirectory 'dataset/'"
fi

if [ ! -f "${INPUT_DIR}/index.json" ]; then
  echo "Invalid input directory: '${INPUT_DIR}'. Input directory should contain 'index.json'"
fi

function bucket_path() {
  realpath --relative-to="${INPUT_DIR}" "${1}"
}
export -f bucket_path

function convert_tar_to_zip() {
  dataset_dir=$(dirname "${1}")
  tar_filename="$(basename ${1})"
  zip_dilename=$(basename "${tar_filename%.tar.gz}.zip")
  extracted_dir="$(basename ${tar_filename%.tar.gz})"

  if [ -f "${1}" ]; then
    echo "Processing '${1}'"
    cd "${dataset_dir}"
    tar xf "${tar_filename}" || true
    zip -r "${zip_dilename}" "${extracted_dir}" >/dev/null || true
    rm -rf "${extracted_dir}"
  fi
}
export -f convert_tar_to_zip

function process_one_directory() {
  name=$(bucket_path ${1})
  (convert_tar_to_zip "${INPUT_DIR}/${name}/all_gene_alignments.tar.gz") || true
  (convert_tar_to_zip "${INPUT_DIR}/${name}/core_gene_alignments.tar.gz") || true
}
export -f process_one_directory


find "${INPUT_DIR}" -mindepth 2 -maxdepth 2 -type d | sort | parallel process_one_directory
