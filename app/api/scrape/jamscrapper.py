from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import json
import time

base_urls = {
    'https://www.jambase.com/festivals/de': 'Germany',
    'https://www.jambase.com/festivals/nl': 'Netherlands',
    'https://www.jambase.com/festivals/es': 'Spain'
}

def extract_festival_details(festival_url, driver):
    driver.get(festival_url)
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "ul.list-inline.list-festival-lineup"))
        )
    except TimeoutException:
        print(f"Timeout while waiting for festival details page to load: {festival_url}")
        return "", []

    festival_soup = BeautifulSoup(driver.page_source, "html.parser")

    try:
        script_tag = festival_soup.find("script", type="application/ld+json")
        if script_tag:
            festival_json = script_tag.string
            festival_data = json.loads(festival_json)
            description = festival_data.get("description", "")
        else:
            description = ""

        lineup = []
        lineup_list = festival_soup.find("ul", class_="list-inline list-festival-lineup")
        if lineup_list:
            for artist_item in lineup_list.find_all("li"):
                artist_name = artist_item.find("span", itemprop="name").text.strip()
                lineup.append(artist_name)

        return description, lineup
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error parsing festival details for festival: {festival_url} - {e}")
        return "", []

def scrape_festival_page(url, driver):
    driver.get(url)
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "li.jbshow"))
        )
    except TimeoutException:
        print(f"Timeout while waiting for festival list page to load: {url}")
        return []

    soup = BeautifulSoup(driver.page_source, "html.parser")
    return soup.find_all("li", class_="jbshow")

if __name__ == "__main__":
    festivals = {}
    driver = webdriver.Chrome()

    try:
        for base_url, country in base_urls.items():
            page_num = 1
            while True:
                current_url = f"{base_url}/page/{page_num}"
                festival_items = scrape_festival_page(current_url, driver)
                
                if not festival_items:
                    break
                
                for festival_item in festival_items:
                    try:
                        name = festival_item.find("h4", class_="post-title").text.strip()
                        date = festival_item["data-date"]
                        location = festival_item.find("li", class_="venue-address-simple").text.strip()
                        festival_url = festival_item.find("a", class_="post-title-wrap")["href"]
                        image_url = festival_item.find("img")["src"]
                        
                        description, lineup = extract_festival_details(festival_url, driver)

                        festival_info = {
                            'name': name,
                            'date': date,
                            'location': location,
                            'country': country,
                            'url': festival_url,
                            'description': description,
                            'lineup': lineup,
                            'image_url': image_url
                        }
                        festivals[name] = festival_info

                    except AttributeError as e:
                        print(f"Error processing festival item: {e}")
                        continue
                
                page_num += 1
                print(f"Moving to next page: {current_url}")
                time.sleep(2)  # Add delay to avoid overloading the server

    finally:
        driver.quit()

    with open("jambase_festivals.json", 'w') as json_file:
        json.dump(festivals, json_file, indent=4)