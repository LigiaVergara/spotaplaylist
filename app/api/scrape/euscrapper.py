from selenium import webdriver
from bs4 import BeautifulSoup
import time
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from concurrent.futures import ThreadPoolExecutor

# URLs for each country
urls = {
    "Germany": 'https://www.songkick.com/festivals/countries/de',
    "Spain": 'https://www.songkick.com/festivals/countries/es',
    "The Netherlands": 'https://www.songkick.com/festivals/countries/nl',
    "Sweden": 'https://www.songkick.com/festivals/countries/se',
    "France": 'https://www.songkick.com/festivals/countries/fr',
}

# Function to extract festival details (now threaded)
def extract_festival_details(festival_url, driver):
    driver.get(festival_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.microformat"))
    )
    festival_soup = BeautifulSoup(driver.page_source, "html.parser")

    try:
        description_element = festival_soup.find("div", class_="microformat")
        lineup_elements = festival_soup.select("div.line-up ul.festival li a")
        return description_element.text.strip() if description_element else "", [
            artist.text.strip() for artist in lineup_elements
        ]
    except AttributeError:
        return "", []  # Return empty values if data is not found


# Main function
if __name__ == "__main__":
    festivals = {}
    driver = webdriver.Chrome()
    with ThreadPoolExecutor() as executor:
        for country, url in urls.items():
            driver.get(url)

            soup = BeautifulSoup(driver.page_source, "html.parser")
            festival_items = soup.find_all("li", title=True)

            for festival_item in festival_items:
                try:
                    name = festival_item.find("p", class_="artists summary").find("a").strong.text.strip()
                    date = festival_item["title"].strip()
                    location = festival_item.find("span", class_="venue-name").text.strip()
                    festival_url = "https://www.songkick.com" + festival_item.find("a", class_="thumb")["href"]

                    # Store festival info *before* submitting to the thread pool
                    festival_info = {
                        'name': name,
                        'date': date,
                        'location': location,
                        'url': festival_url,
                        'country': country,
                        'description': "",
                        'lineup': []
                    } 
                    festivals[name] = festival_info
                    # Submit festival details extraction to thread pool
                    future = executor.submit(extract_festival_details, festival_url, driver)
                    festival_info['description'], festival_info['lineup'] = future.result()

                except AttributeError:
                    continue

    driver.quit()

    with open("songkick_festivals.json", 'w') as json_file:
        json.dump(festivals, json_file, indent=4)
