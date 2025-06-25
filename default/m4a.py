import os

# need to create these folders in folder with this file!
fin = '.\\audio_in'
fout = '.\\m4a_out'

def process_file(input_path, output_path):
    os.system(f'ffmpeg -i {input_path} -map 0:a -vn -c:a aac -b:a 96k -movflags +faststart {output_path + ".m4a"}')
    # -map 0:a -vn (remove poster/video)

def main():
    files = [f for f in os.listdir(fin) if os.path.isfile(os.path.join(fin, f))]
    if len(files) == 0: return
    
    for file in files:
        input_path = os.path.join(fin, file)
        output_path = os.path.splitext(os.path.join(fout, file))[0]
        process_file(input_path, output_path)

if __name__ == "__main__":
    main()

