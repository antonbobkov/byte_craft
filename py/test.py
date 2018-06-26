import os, subprocess

hs_dir = "/home/antongml/offline_projects/city_building_game_v1/hs/minecraft-viewer/"
web_dir = "/var/www/html/"

out = []

def process_out(s):
    s = s.decode('utf-8')
    if len(s) > 0:
        s = s[:-1]
    return s

    
def run_cmd(command):
    cmd_out = [];

    command_ls = command.split();

    # res = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, executable='/bin/bash')
    res = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    cmd_out.append("CMD: " + command);
    if len(res.stdout) > 0:
        cmd_out.append("STDOUT: " + process_out(res.stdout));
    if len(res.stderr) > 0:
        cmd_out.append("STDERR: " + process_out(res.stderr));
    if res.returncode != 0:
        cmd_out.append("RETURN: " + str(res.returncode));
    cmd_out.append("");

    out.append("\n".join(cmd_out));
    print(out[-1])
    
    # out.append(command)
    # print(out[-1])
    # out.append(os.popen(command).read())
    # print(out[-1])
    

import time, datetime

out.append(datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'))
print(out[-1])

run_cmd('whoami')
run_cmd('echo $0')
run_cmd('pwd')

os.chdir(hs_dir)

run_cmd('pwd')


run_cmd('/usr/local/bin/stack exec viewer')

run_cmd('cp ' + hs_dir + '*.png ' + web_dir)
run_cmd('cp ' + hs_dir + '*values.js ' + web_dir)
    
with open("/home/antongml/offline_projects/city_building_game_v1/py/log.txt", 'a') as f:
    for s in out:
        f.write(s + '\n')

# print( subprocess.check_output(['cd', '..']) )

