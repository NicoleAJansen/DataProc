#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
# Week 6

"""
This script converts a csvfile into a jsonfile.
The format of the jsonfile is:
    [{key1 : value1, ..., keyn : valuen}, ...,
     {key1 : value1, ..., keyn : valuen}]

This script is specifically for "./Week_6/..... TODO

Usage: convertCSV2JSON.py "csvfilename" ("jsonfilename")
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
    if not ((len(arguments) == 2) or len(arguments) == 3):
        print("Name of the file (and name of jsonfile) is needed")
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
    if len(arguments) == 2:
        filename_json = arguments[1][:-3] + "json"
    elif len(arguments) == 3:
        filename_json = arguments[2]

    if os.path.isfile(filename_json):
        print("JSONfile already exists")
        exit(1)

def initializeDict(data_dict):
    with open("geslacht.json", "r") as dataGender:
        gender = json.load(dataGender)

        for thisGender in gender.keys():
            data_dict[thisGender] = dict()
            with open("leeftijd.json", "r") as dataAge:
                age = json.load(dataAge)

                for thisAge in age.keys():
                    data_dict[thisGender][thisAge] = dict()
                    with open("perioden.json", "r") as dataYears:
                        years = json.load(dataYears)
                        for thisYear in years.keys():
                            data_dict[thisGender][thisAge][thisYear] = dict()


def load_csv(filename):
    """
    Loads csvfile and puts data into dictionary
    """

    # open csvfile
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";")

        # Put data in global list
        for row in reader:
            keys = list(row.keys())

            #print(row)
            # Create dictionary with data that will be saved in jsonfile
            this_dict = dict()
            for key in (keys[4:]):
                this_dict[key] = row[key]
            data_dict[row["Geslacht"]][row["Leeftijd"]][row["Perioden"]] = this_dict


def save_json(filename):
    """
    Saves data as a jsonfile.
    """
    with open(filename, "w", newline='') as write_file:
        json.dump(data_dict, write_file)


if __name__ == "__main__":
    check_arguments(sys.argv)
    initializeDict(data_dict)
    load_csv(sys.argv[1])

    if len(sys.argv) == 2:
        filename_json = sys.argv[1][:-3] + "json"
    elif len(sys.argv) == 3:
        filename_json = sys.argv[2]
    save_json(filename_json)
