#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
"""
This script converts a csvfile into a jsonfile.
Usage: convertCSV2JSON.py "filename"
"""

import sys
import csv
import json
import os

# Global variable for data
data_dict = dict()

def check_arguments(arguments):
    """
    Checks if commandline arguments are correct
    """

    # Check if proper amount of commandline arguments are given
    if len(arguments) != 2:
        print("Name of the file is needed")
        exit(1)

    # Check if filename ends with ".csv"
    end_word = arguments[1][-4:]
    if end_word != ".csv":
        print("Must be a csvfile")
        exit(1)

    # Check if file exists
    try:
        open(arguments[1])
    except:
        print("File cannot be opened")
        exit(1)

    # Check if jsonfile already exists
    filename_json = arguments[1][:-3] + "json"
    if os.path.isfile(filename_json):
        print("JSONfile already exists")
        exit(1)


def load_csv(filename):
    """
    Loads csvfile and puts data into dictionary
    """

    # open csvfile
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)

        # Put data in gloabal dictionary
        for row in reader:
            keys = list(row.keys())
            keys_new = keys[1:]

            # Create dictionary with all data exept first key
            this_dict = dict()
            for key in keys_new:
                this_dict[key] = row[key]

            # Add new data to global dictionary
            data_dict[row[keys[0]]] = this_dict


def save_json(filename):
    """
    Saves data as a jsonfile.
    """
    filename_json = filename[:-3] + "json"
    with open(filename_json, "w", newline='') as write_file:
        json.dump(data_dict, write_file)



if __name__ == "__main__":
    check_arguments(sys.argv)
    load_csv(sys.argv[1])
    save_json(sys.argv[1])
