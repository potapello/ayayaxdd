(English version of the README at bottom)
Created for "AYAYA Anime Roulette" by potapello
================================================================
Для запуска этих файлов нужно:

1. Иметь установленные Python и FFmpeg
2. Переместить эти скрипты в папку FFmpeg (ffmpeg/bin/)
3. Создать папки для файлов в папке со скриптами:
    Для видео (libx264.py): "video_in", "264_out"
    Для аудио (m4a.py): "audio_in", "m4a_out"

*** В файле скрипта можно поменять название/путь вводных/выводных папок для файлов (переменные `fin` и `fout` соответственно)

(ТОЛЬКО ДЛЯ ВИДЕО, libx264)

Если есть необходимость добавить дополнительные аргументы для ffmpeg, то это можно сделать файлами для каждого видео в папке `video_in`.

Допустим, есть файл `video01.mp4`, и для него нужно добавить аргумент, то сделать это можно, создав текстовый файл с таким же названием `video01.txt`. В этом текстовом файле в ОДНУ СТРОКУ можно писать свои аргументы.

Примеры:

Убрать первые 30 секунд у видео:
-ss 00:00:30
(указывается время начала итогового видео)

Убрать последние 30 секунд (допустим, видео длится 2 минуты):
-to 00:01:30
(указывается время конца итогового видео)

Можно указать сразу начало и конец итогового файла:
-ss 00:00:30 -to 00:01:10
(так можно вырезать нужный фрагмент, он будет в итоговом файле)

================================================================
To run these files, you need to:

1. Have Python and FFmpeg installed.
2. Move these scripts to the FFmpeg folder (ffmpeg/bin/).
3. Create the following directories in the script folder:
    For video (libx264.py): "video_in", "264_out"
    For audio (m4a.py): "audio_in", "m4a_out"

*** You can modify the input/output folder names/paths in the script file (variables `fin` and `fout` respectively).

(ONLY FOR VIDEO, libx264)

If you need to add custom FFmpeg arguments for specific videos, you can do so by creating individual configuration files for each video in the `video_in` folder.

For example, if you have a file `video01.mp4` and want to apply custom arguments to it, create a text file with the same name `video01.txt`. In this text file, you can write your FFmpeg arguments in a SINGLE LINE.

Examples:

Trim the first 30 seconds of the video:
-ss 00:00:30
(This sets the start time of the final video.)

Trim the last 30 seconds (e.g., if the video is 2 minutes long):
-to 00:01:30
(This sets the end time of the final video.)

Specify both start and end times to extract a specific segment:
-ss 00:00:30 -to 00:01:10
(This will cut and keep only the selected part in the final file.)