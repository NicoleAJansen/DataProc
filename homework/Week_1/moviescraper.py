#!/usr/bin/env python
# Name: Nicole Jansen
# Student number: 10963871
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup
import re

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # Find all movie titles and add to movies list
    titles = dom.find_all(href=re.compile("ref_=adv_li_tt"))
    movies = list()
    length = len(titles)
    for title in titles:
        movies.append(title.contents)

    # Get data of each movie
    moviesdata = dom.find_all(attrs={"class" : "lister-item mode-advanced"})
    for i in range(len(moviesdata)):

        # Find ratings of movies and add to movies list
        rate = moviesdata[i].find_all(attrs={"name" : "ir"})
        movies[i].append(float(rate[0]["data-value"]))

        # Find years of release and add to movies list
        year = moviesdata[i].find_all(attrs={"class" : "lister-item-year text-muted unbold"})
        yearstr = year[0].string

        # Make sure only numerical value will be added
        year = get_numerical(yearstr, int)
        movies[i].append(year)

        # Add actors and actresses to movies list
        actors = moviesdata[i].find_all(href=re.compile("ref_=adv_li_st"))

        # Create single string with cast
        cast = ""
        for actor in actors:
            cast += actor.string + ", "
        end = len(cast)
        cast = cast[0:(end-2)]
        movies[i].append(cast)

        # Add runtime to movies list
        runtimedata = moviesdata[i].find(attrs={"class" : "runtime"})

        # Make sure that only numerical value will be added
        runtimestr = runtimedata.string
        runtime = get_numerical(runtimestr, float)

    return movies

def get_numerical(str, typ):
    """
    Get only the numerical data form a string.
    'typ' should be 'int' or 'float', depending on type of output is desired
    """
    number = ""
    for letter in str:
        if letter.isnumeric():
            number += letter

    return typ(number)

def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # Add info of the movies to the csv-file
    for info in movies:
        writer.writerow(info)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
