import requests, json, os

print('\n | Script for download "manami-project/anime-offline-database" (minified version) and compress.')
print(' | by potapello | for "AYAYA Anime Roulette"\n')

print('Getting latest release...')
latest_url = 'https://api.github.com/repos/manami-project/anime-offline-database/releases/latest'
latest = requests.get(latest_url).json()
print(f'Latest release => "{latest['tag_name']}"')

source_file = 'source.json'
def downloadSource():
    # delete old source
    if os.path.isfile(source_file):
        os.remove(source_file)
    # download latest release
    print(f'\nDownloading latest release => "{latest['tag_name']}"')
    download_url = f'https://github.com/manami-project/anime-offline-database/releases/download/{latest['tag_name']}/anime-offline-database-minified.json'
    global request
    request = requests.get(download_url, stream=True)
    # download database by chunks
    with open(source_file, 'wb') as file:
        progress = 0
        for content in request.iter_content(1024*1024):
            file.write(content)
            progress += 1
            print(f'Downloaded: {progress} MB', end='\r')

    print('Downloaded!', end='\r')
    print('\n')

# check old source file
def checkSourceFile():
    if os.path.isfile(source_file):
        print('Some release already downloaded (source.json)!\n    [0] Work with "source.json"\n    [1] Delete & Download new')
        res = input('\n>>> ')
        if res == '0':
            print('\nWork with "source.json"')
            return
        elif res == '1':
            downloadSource()
        else:
            os.system('cls')
            checkSourceFile()
    else:
        downloadSource()
#
checkSourceFile()

# try to get used tags
tags = {
    'use': False,
    'tags': [],
    'file': 'tags.json' 
}

if os.path.isfile(tags['file']):
    with open(tags['file'], 'r', encoding='utf-8') as f:
        tags['tags'] = json.load(f)['tags']
        tags['use'] = True
    print('File "tags.json" provided.')
else:
    print('File "tags.json" not provided. Compression will be less effective.')

def compress(element, index):
    if isinstance(element, dict):
        # delete unused
        if 'synonyms' in element : del element['synonyms']
        if 'relations' in element : del element['relations']
        if 'relatedAnime' in element : del element['relatedAnime']
        if 'thumbnail' in element : del element['thumbnail']
        if 'studios' in element : del element['studios']
        if 'producers' in element : del element['producers']
        # set dbid
        element['fake_dbid'] = index
        # get score
        if('score' in element):
            global processed_data
            processed_data['scored'] += 1
            element['score'] = round(element['score']['arithmeticMean'], 2)
            # arithmeticMean - там значения ближе к реальности, ещё есть arithmeticGeometricMean и median
        else:
            element['score'] = None
        # save only used tags
        if tags['use']:
            used = []
            for tag in element['tags']:
                if tag in tags['tags']:
                    used.append(tag)
            element['tags'] = used
    #
    return element

processed_data = {}

def process_json_file(output_file):
    # read source
    with open(source_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # get count
    count = len(data['data'])
    print(f'Count of titles: {str(count)}. Processing...')
    # get meta
    global processed_data
    processed_data['license'] = data['license']
    processed_data['repository'] = data['repository']
    processed_data['lastUpdate'] = data['lastUpdate']
    processed_data['scored'] = 0
    # process anime data
    processed_data['data'] = []
    for i in range(0, count):
        processed_data['data'].append(compress(data['data'][i], i))
    # count of result
    print(f'\nProcessed titles: {len(processed_data['data'])}\nScored: {processed_data['scored']}\nSaving...')
    # dump
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    #
    print(f'\nCompressed database saved!\n >>> "{output_file}"\n')
    # except Exception as e:
    #     print(f"Error: {str(e)}")

# delete output & start
output_file = 'database.json'

if os.path.isfile(output_file):
    os.remove(output_file)

process_json_file(output_file)

# end
os.system('pause')