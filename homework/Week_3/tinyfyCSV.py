#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
"""
This script makes the original datafile (doi.org/10.5281/zenodo.44529) smaller
by only keeping subjects with either a milk or peanut allergy or both and
removing information about the other allergies, as the original datafile is too
big for GitHub.
"""

import csv

# Global constant with keys of which data will be kept
DATA_KEYS = ["SUBJECT_ID","BIRTH_YEAR","GENDER_FACTOR","AGE_START_YEARS",
             "AGE_END_YEARS","MILK_ALG_START","MILK_ALG_END","PEANUT_ALG_START",
             "PEANUT_ALG_END"]

# Global variable for data
data_list = list()


def load_csv(filename):
    """
    Loads csvfile and puts data into global list
    """
    # Open csvfile
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)

        # Put data in gloabal list
        for row in reader:
            # Get data of subject with either or both milk and peanut allergy
            if row["MILK_ALG_START"] != "NA" or row["PEANUT_ALG_START"] != "NA":
                sub_list = list()
                for key in DATA_KEYS:
                    sub_list.append(row[key])

                # Add data of subject to all data 
                data_list.append(sub_list)


def save_csv(outputfile):
    """
    Saves data as a csv-file
    """
    with open(outputfile, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(DATA_KEYS)

        # Add data to csv-file
        for data in data_list:
            writer.writerow(data)


if __name__ == "__main__":
    filename = "food-allergy-analysis-Zenodo.csv"
    load_csv(filename)

    outputfile = "food-allergy-tiny.csv"
    save_csv(outputfile)
