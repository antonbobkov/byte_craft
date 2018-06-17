import os

hs_dir = "/home/antongml/offline_projects/city_building_game_v1/hs/minecraft-viewer/"
web_dir = "/var/www/html/"

out = []

def run_cmd(command):
    out.append(command)
    print(out[-1])
    out.append(os.popen(command).read())
    print(out[-1])
    

run_cmd('pwd')

os.chdir(hs_dir)

run_cmd('pwd')

import time, datetime

out.append(datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'))
print(out[-1])

out.append('HASKELL:')
run_cmd('stack exec viewer')

run_cmd('cp ' + hs_dir + '*.png ' + web_dir)
run_cmd('cp ' + hs_dir + '*values.json ' + web_dir)
    
with open("/home/antongml/offline_projects/city_building_game_v1/py/log.txt", 'a') as f:
    for s in out:
        f.write(s + '\n')

# print( subprocess.check_output(['cd', '..']) )

