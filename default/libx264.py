import os

# need to create these folders in folder with this file!
fin = '.\\video_in'
fout = '.\\264_out'

def process_file(input_path, output_path, args=''): # -ss 00:01:30 -to 00:02:15
    os.system(f'ffmpeg -i {input_path} {args} -vf "scale=-2:720,fps=30" -c:v libx264 -preset veryslow -crf 28 -tune animation -pix_fmt yuv420p -movflags +faststart -an {output_path + ".mp4"}')
    # -vf "scale=-2:720,fps=30" | set video to 720p30
    # -pix_fmt yuv420p | optimal pixel format
    # -an | remove all audio
    # -crf 28 | compression rate
    # -preset veryslow | slow compression speed but better quality

def get_args_from_file(input_file_path):
    args_file_path = os.path.splitext(input_file_path)[0] + ".txt"
    
    if not os.path.exists(args_file_path):
        return ''
    
    with open(args_file_path, "r", encoding="utf-8") as f:
        first_line = f.readline()
    
    if len(first_line) > 0: return first_line 
    else: return ''

def main():
    files = [f for f in os.listdir(fin) if os.path.isfile(os.path.join(fin, f))]
    if len(files) == 0: return
    
    for file in files:
        input_path = os.path.join(fin, file)
        if input_path.endswith('.txt'): continue # skip args files

        output_path = os.path.splitext(os.path.join(fout, file))[0]
        process_file(input_path, output_path, args=get_args_from_file(input_path))

if __name__ == "__main__":
    main()