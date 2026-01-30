#!/bin/bash

# Usage: ./draw-from-md.sh input.md [output.png]
# If output is not provided, it defaults to input_name.png

INPUT_MD=$1
OUTPUT_IMG=${2}

if [[ -z ${INPUT_MD} ]]; then
	echo "Usage: $0 input.md [output.png]"
	exit 1
fi

# Determine default output if not provided
if [[ -z ${OUTPUT_IMG} ]]; then
	OUTPUT_IMG="${INPUT_MD%.*}.png"
fi

echo "Generating diagram from ${INPUT_MD} to ${OUTPUT_IMG}..."

# mmdc -i <input.md> -o <output>
# Note: If output is .png and input is .md, mmdc might generate <input>-1.png.
# We want to ensure the final output is what the user asked for.

# Run mmdc
mmdc -i "${INPUT_MD}" -o "${OUTPUT_IMG}"

# Check exit code for verification
EXIT_CODE=$?
if [[ ${EXIT_CODE} -ne 0 ]]; then
	echo "Error: mmdc failed with exit code ${EXIT_CODE}"
	exit "${EXIT_CODE}"
fi

# If input was .md and output was specified as .png, mmdc often creates <input_base>-1.png instead of the literal output name.
# Let's check if the expected file exists.
if [[ ! -f ${OUTPUT_IMG} ]]; then
	# Check for the common suffix pattern
	BASE_NAME=$(basename "${INPUT_MD%.*}")
	DIR_NAME=$(dirname "${OUTPUT_IMG}")
	SUFFIXED_FILE="${DIR_NAME}/${BASE_NAME}-1.png"

	if [[ -f ${SUFFIXED_FILE} ]]; then
		echo "Renaming ${SUFFIXED_FILE} to ${OUTPUT_IMG}"
		mv "${SUFFIXED_FILE}" "${OUTPUT_IMG}"
	else
		# Try other formats if provided
		EXT="${OUTPUT_IMG##*.}"
		SUFFIXED_EXT_FILE="${DIR_NAME}/${BASE_NAME}-1.${EXT}"
		if [[ -f ${SUFFIXED_EXT_FILE} ]]; then
			echo "Renaming ${SUFFIXED_EXT_FILE} to ${OUTPUT_IMG}"
			mv "${SUFFIXED_EXT_FILE}" "${OUTPUT_IMG}"
		fi
	fi
fi

if [[ -f ${OUTPUT_IMG} ]]; then
	echo "Success: Diagram generated at ${OUTPUT_IMG}"
else
	echo "Error: Output file ${OUTPUT_IMG} was not created."
	exit 1
fi
