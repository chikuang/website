---
title: "MFCF computing resource shortguide"
date: 2025-02-02
description: "Demonstrate how to use UW MFCF computing resources, including VPN, server connection, and running R scripts."
tags: ["tutorial", "R", "Computing"]
categories: ["resources"]
---

**Only read if you wanna use school server**

# Which Operating System do you use?
  +  In all OS, you can use Terminal or cmd to connect, but I perfer not using it as a beginner.
  +  Windows, depends on the version of your OS… but I strongly recommend using WSL2. Otherwise, you may use Putty. In addition, I think MobaXterm is a good choice to connect to the servers.
  +  MacOS, well… you may just use terminal. I think even Screen Sharing client, a default software works. Alternative, you may use royal TSX.
  + Linux, I prefer Remmina.

# Download Cisco - the VPN softwaare if you are off campus

  + Waterloo Web
  + Find the installization guide on the right hand side, and choose the appropriate OS.
  + Type your WatIAM ID and password to download.
  + Open Sever/connect to cn-vpn-uwaterloo.ca and type the account & password
  + You may need to obtain the second password using the DUO mobile app.

# Open the software and connect to the servers

1. Windows server - use Microsoft RDP I think is the easiest way. Let me know if you do not know how to use.

    * The address is yourWatIAMid@windows.math.uwaterloo.ca

2. Linux servers - use the thing you download in the first place.
    * The address is yourWatIAMid@cpuXXX.math.private.uwaterloo.ca
  * Description can be found HERE and HERE
  * The description of the CPUs are in HERE

3. High-performance computing (HPC) & Graphics processing unit (GPU) cluster/server
    * It requires a bit more domain knowledge…
    * There are some good readings, such as 1.
    * It can do good in parallel computing (you have more cores).

4. Check usage of the server you logged in
  & some commands… e.g. htop, top for memory usage, and a lot more

# Running code on the server

1. log onto the (Linux) server, say, cpu151.math.private.uwaterloo.ca

2. cd to the directory where your code is located.

3. Type Rscript your_code.R to run the code.

4. You may want to use the nohup command to run the code in the background. For example, nohup Rscript your_code.R &

# Contact

If you have questions or wonders. Feel free to contact me

  1. chi-kuang.yeh@uwaterloo.ca or chi-kuang.yeh@mail.mcgill.ca

  2. I am currently a CANSSI Distinguish Postdoctoral Fellow at McGill University

  3. My website is https://chikuang.github.io/

  4. Life learner 😉