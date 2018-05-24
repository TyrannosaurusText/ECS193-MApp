#! /bin/bash
# /etc/rc.locale
bluetoothctl << EOF
power on
EOF
cd /home/pi/Documents/PatchSim
sudo node sim.js
