from selenium import webdriver
from bs4 import BeautifulSoup
import pandas as pd
import time
from collections import defaultdict

# Change URL for every type of drink
base_url = "https://www.songkick.com/festivals/countries/de"
driver = webdriver.Chrome()
driver.get(base_url)

# Function to scroll down gradually and detect dynamic loading
def scroll_down_and_wait(driver, timeout=10):
    scroll_pause_time = 1.5
    wait_time = 0
    last_height = driver.execute_script("return document.body.scrollHeight;")
    
    while wait_time < timeout:
        # Scroll down by a small increment
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(scroll_pause_time)
        
        # Calculate new scroll height and compare with last scroll height
        new_height = driver.execute_script("return document.body.scrollHeight;")
        if new_height == last_height:
            wait_time += scroll_pause_time
        else:
            wait_time = 0
        
        last_height = new_height

# Scroll down gradually and wait for content to load
scroll_down_and_wait(driver)

# Get the page source after scrolling
page_source = driver.page_source
soup = BeautifulSoup(page_source, "html.parser")
festival_items = soup.find_all("li", title=True)

# Print number of items found to debug
print(f"Found {len(festival_items)} festival items")

# Create a dictionary to store data
festivals = defaultdict(dict)

for festival in festival_items:
    try:
        name = festival.find("strong").text.strip()
        date = festival["title"].strip()
        location = festival.find("span", class_="venue-name").text.strip()
        url = "https://www.songkick.com" + festival.find("a", class_="thumb")["href"]

        festivals[name] = {
            'date': date,
            'location': location,
            'url': url
        }
    except (AttributeError, KeyError) as e:
        print(f"Error extracting data from item: {e}")

# Additional scraping for each festival URL
for name, details in festivals.items():
    festival_url = details['url']
    driver.get(festival_url)
    time.sleep(2)  # Adjust sleep time if needed
    festival_page_source = driver.page_source
    festival_soup = BeautifulSoup(festival_page_source, "html.parser")
    
    try:
        # Example of additional information: description and lineup
        description = festival_soup.find("div", class_="microformat").text.strip() if festival_soup.find("div", class_="microformat") else ""
        lineup = [artist.text.strip() for artist in festival_soup.select("div.line-up ul.festival li a")]

        festivals[name]['description'] = description
        festivals[name]['lineup'] = lineup
    except AttributeError as e:
        print(f"Error extracting additional data for {name}: {e}")

driver.quit()

# Debug: print out the collected data
print(festivals)

# Convert the dictionary to a DataFrame
df = pd.DataFrame.from_dict(festivals, orient='index')

# Change file name appropriately
output_filename = "songkick_festivals_de.csv"
df.to_csv(output_filename, index=True)

print(f"Scraped {len(df)} items. Data saved to {output_filename}")