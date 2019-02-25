#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
"""
This script applies Exploratory Data Analysis (EDA) and visualizes some of the
data
"""

import csv
import pandas
import numpy as np
import matplotlib.pyplot as plt
import json
import os


# Global variable for input file
INPUT_CSV = "input.csv"

data_frame = pandas.DataFrame()


def load_data():
    """
    Load data from csvfile into data frame
    """
    # Create data frame from csvfile
    with open(INPUT_CSV) as csvfile:
        data_frame = pandas.read_csv(csvfile)

    # Remove unnecessary spaces
    data_frame["Country"] = data_frame["Country"].str.strip()
    data_frame["Region"] = data_frame["Region"].str.strip()

    # Change data values into numbers (float)
    data_frame["Pop. Density (per sq. mi.)"] = data_frame["Pop. Density (per sq. mi.)"].str.replace(",", ".")
    data_frame["Pop. Density (per sq. mi.)"] = pandas.to_numeric(data_frame["Pop. Density (per sq. mi.)"], errors="coerce")

    data_frame["Infant mortality (per 1000 births)"] = data_frame["Infant mortality (per 1000 births)"].str.replace(",", ".")
    data_frame["Infant mortality (per 1000 births)"] = pandas.to_numeric(data_frame["Infant mortality (per 1000 births)"], errors="coerce")

    data_frame["GDP ($ per capita) dollars"] = data_frame["GDP ($ per capita) dollars"].str.replace(",", ".")
    data_frame["GDP ($ per capita) dollars"] = data_frame["GDP ($ per capita) dollars"].str.replace("dollars", "")
    data_frame["GDP ($ per capita) dollars"] = pandas.to_numeric(data_frame["GDP ($ per capita) dollars"], errors="coerce")

    return data_frame


def central_tendency(data_frame):
    """
    Prints mean, meadian, mode and standard deviation of the GDP ($ per capita),
    plots histogram, removes ourlier and plots new histogram without ourlier.
    Outlier is defined as median +/- 3 * standard deviation
    """
    column_index = "GDP ($ per capita) dollars"

    # Calculate meand, median, mode and std
    mean_GDP = data_frame[column_index].mean()
    median_GDP = data_frame[column_index].median()
    mode_GDP = data_frame[column_index].mode()
    std_GDP = data_frame[column_index].std()

    print(f"mean = {mean_GDP}\nmedian = {median_GDP}\nmode = {mode_GDP}\nstd = {std_GDP}")

    # Plot data as a histogram
    fig = plt.figure()
    ax = data_frame[column_index].plot.hist()
    plt.title("GDP ($ per capita) per country")
    ax.set_xlabel("GDP ($ per capita)")
    plt.show()

    # Remove outlier
    index = data_frame[column_index].index[data_frame[column_index].apply(lambda x : x >= (mean_GDP + 3*std_GDP))]
    value = data_frame[column_index][index].to_list()
    data_frame = data_frame.replace({column_index :value[0]}, np.nan)

    # Calculate new mean, median, mode and std
    mean_GDP = data_frame[column_index].mean()
    median_GDP = data_frame[column_index].median()
    mode_GDP = data_frame[column_index].mode()
    std_GDP = data_frame[column_index].std()

    print(f"mean = {mean_GDP}\nmedian = {median_GDP}\nmode = {mode_GDP}\nstd = {std_GDP}")

    # Plot new data as histogram
    fig = plt.figure()
    ax = data_frame[column_index].plot.hist()
    plt.title("GDP ($ per capita) per country - outlier removed")
    ax.set_xlabel("GDP ($ per capita)")
    plt.show()

    return data_frame


def five_num_sum(data_frame):
    """
    Gives Five Number Summary; prints minimum, first quartile, median,
    third Quartile and maximum of the infant mortality and plots a boxplot with
    those values.
    """
    # Calculate "five numbers"
    min = data_frame["Infant mortality (per 1000 births)"].min()
    q1 = data_frame["Infant mortality (per 1000 births)"].quantile(q=0.25)
    median = data_frame["Infant mortality (per 1000 births)"].median()
    q3 = data_frame["Infant mortality (per 1000 births)"].quantile(q=0.75)
    max = data_frame["Infant mortality (per 1000 births)"].max()

    print(f"\nmin = {min}\nq1 = {q1}\nmedian = {median}\nq3 = {q3}\nmax = {max}")

    # Plot boxplot
    ax = data_frame["Infant mortality (per 1000 births)"].plot.box(vert=False, whis="range")
    plt.title("Infant mortality over the world")
    ax.tick_params(labelleft=False, left=False)
    ax.set_xlabel("Infant mortality (per 1000 births)")
    plt.show()


def save_json(data_frame):
    """
    Saves data into an JSON file
    """
    # Create dictionary with data in correct format
    data_dict = dict()
    for i in range(len(data_frame)):
        country_data = data_frame.loc[i, :]
        country_dict = country_data[["Region", "Pop. Density (per sq. mi.)",
            "Infant mortality (per 1000 births)", "GDP ($ per capita) dollars"]].to_dict()
        data_dict[country_data["Country"]] = country_dict

    # Get directory path
    dir_path = os.path.dirname(os.path.realpath(__file__))
    dir_path += "/data_after_deadline.json"

    # Save dictionary as JSON file
    with open(dir_path, "w") as write_file:
        json.dump(data_dict, write_file)


if __name__ == "__main__":
    data_frame = load_data()
    print(data_frame)
    data_frame = central_tendency(data_frame)
    five_num_sum(data_frame)
    save_json(data_frame)
