#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
from matplotlib import gridspec
import numpy as np


# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}


def load_data():
    """
    Load data form csvfile into dictionary.
    """
    with open(INPUT_CSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data_dict[row['Year']].append(float(row['Rating']))


def get_av():
    """
    Get averages and standard deviation for each year and overall.
    """
    averages = []
    sd = []
    all = []
    for key in data_dict:
        averages.append(np.mean(data_dict[key]))
        sd.append(np.std(data_dict[key]))
        all += data_dict[key]

    mean_all = np.mean(all)
    std_all = np.std(all)

    return averages, sd, mean_all, std_all


def plot_data():
    """
    Plot the data with different types of plots.
    """

    # Get averages and standard deviations (per year and overall)
    averages, sd, av_all, sd_all = get_av()

    # Create lists for years, average, and average +- std
    x = range(START_YEAR, END_YEAR)
    av_list = np.ones(len(x)) * av_all
    sdp = av_list + sd_all
    sdm = av_list - sd_all

    # Plot a simple line plot showing only the averge rating for each year
    plot_zigzag(x, averages, '-o', "year", "average rating", [5.5, 10])

    # Plot a simple line plot showing both the average rating each year as well
    # as the average overall rating and the standard deviation overall
    plot_zigzag(x, averages, '-o', "year", "average rating", [5.5, 10],
    plot_mean_all=True, av_list=av_list, sdp=sdp, sdm=sdm, legend=True)

    # Create a scatterplot showing ratings for each movie, the average rating
    # for each year, the overall average rating and standard deviation
    plot_zigzag(x, averages, [], "year", "average rating", [5.5, 10],
    plot_mean_all=True, av_list=av_list, sdp=sdp, sdm=sdm,
    scatter=True, legend=True)

    # Show all plots
    plt.show()


def plot_zigzag(x, y, linetype, xlabel, ylabel, ylim, **additional_input):
    """
    Creates a line plot with a zig-zag at the bottom of the y-xaxis
    Credits (zigzag):
        https://matplotlib.org/examples/pylab_examples/broken_axis.html

    Dependencies:
        matplotlib.pyplot as plt
        matplotlib.gridspec as gridspec
    """

    # Make sure optional additional input is handled correctly
    if "plot_mean_all" in additional_input:
        plot_mean_all = additional_input["plot_mean_all"]

        # Check if correct type
        if type(plot_mean_all) != bool:
            print("plot_mean_all should be boolean")
            return

        # Check if data needed to plot overall mean is given
        try:
            av_list = additional_input["av_list"]
            sdp = additional_input["sdp"]
            sdm = additional_input["sdm"]
        except KeyError:
            print("av_list, sdp, and sdm needed")
            return
    else:
        plot_mean_all = False

    if "scatter" in additional_input:
        scatter = additional_input["scatter"]

        # Check if correct type
        if type(scatter) != bool:
            print("scatter schould be boolean")
            return
    else:
        scatter = False

    if "legend" in additional_input:
        legend = additional_input["legend"]

        # Check if correct type
        if type(legend) != bool:
            print("legend should be boolean")
            return
    else:
        legend = False

    # Create subplots with differences in height
    fig = plt.figure()
    height_ratio = 50
    gs = gridspec.GridSpec(3, 1, height_ratios=[height_ratio, 1, 1])
    ax1 = plt.subplot(gs[0])
    ax2 = plt.subplot(gs[1])
    ax3 = plt.subplot(gs[2], sharex=ax1)

    # Plot given data depending on input
    if plot_mean_all:
        # Plot the overall average and overall standard deviation
        xav = list(x)
        xav[0] -= 0.25
        xav[9] += 0.25
        av = ax1.plot(xav, av_list, color="C0", linestyle='-', alpha=0.5)
        sd1 = ax1.plot(xav, sdp, color="C0", linestyle='--', alpha=0.5)
        sd2 = ax1.plot(xav, sdm, color="C0", linestyle='--', alpha=0.5)

        # Color the area between the (average + std) and (average - std)
        ax1.fill_between(xav, sdp, sdm, facecolor="C0", alpha=0.025)

    if not scatter:
        # Plot the average rating per year as line plot
        line = ax1.plot(x, y, linetype)

        # Plot correct legend
        if legend and plot_mean_all:
            ax1.legend((line[0], av[0], sd1[0]), ("average (year)",
                "average (total)", "standard deviation (total)"))
        elif legend:
            ax1.legend((line[0]), ("average (year)"))

    elif scatter:
        # Plot individual ratings as scatter
        for key in data_dict:
            values = data_dict[key]
            x1 = np.ones(len(values)) * int(key)
            rates = ax1.scatter(x1, values, alpha=0.7)

        # Plot average rating per year in the same color as individual ratings
        col = [f"C{i}" for i in range(10)]
        marks = ax1.scatter(x, y, marker='x', color=col)

        # Plot correct legend
        if legend and plot_mean_all:
            ax1.legend((rates, marks, av[0], sd1[0]), ("movie rating",
            "average (year)", "average (total)", "standard deviation (total)"))
        elif legend:
            ax1.legend((rates, marks), ("movie rating", "average (year)"))

    # Set axes limits
    ax1.set_ylim(ylim)
    ax2.set_ylim(0.01, 0.02)
    ax3.set_ylim(0, 0.01)

    # Set appropriate borders invisible
    ax1.spines['bottom'].set_visible(False)
    ax2.spines['top'].set_visible(False)
    ax2.spines['bottom'].set_visible(False)
    ax2.spines['left'].set_visible(False)
    ax2.spines['right'].set_visible(False)
    ax3.spines['top'].set_visible(False)
    ax3.spines['left'].set_visible(False)
    ax3.spines['right'].set_visible(False)

    # Set ticks and labels
    ax1.tick_params(labelbottom=False, bottom=False)
    ax2.tick_params(labelleft=False, labelbottom=False, bottom=False, left=False)
    ax3.tick_params(labelleft=False, left=False)
    ax3.set_xticks(x)

    # Length of zigzag
    len1 = 0.015
    len2 = len1 * (height_ratio - 20)

    # Left or right y-axis
    left = [-len1, +len1]
    right = [1 - len1, 1 + len1]

    # Orientation line (/ or \)
    up = [-len2, +len2]
    down = [1 + len2, 1 - len2]

    # Plot zigzag
    kwargs = dict(transform=ax2.transAxes, color='k', clip_on=False, linewidth=1)
    ax2.plot(left, down, **kwargs)
    ax2.plot(right, down, **kwargs)
    ax2.plot(left, up, **kwargs)
    ax2.plot(right, up, **kwargs)
    kwargs.update(transform=ax3.transAxes)
    ax3.plot(left, down, **kwargs)
    ax3.plot(right, down, **kwargs)
    fig.subplots_adjust(hspace=0.04)

    # Add labels
    ax1.set_ylabel(ylabel)
    ax3.set_xlabel(xlabel)


if __name__ == "__main__":
    load_data()
    plot_data()

    print(data_dict)
