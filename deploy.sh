#!/bin/bash

podman build -f ./Dockerfile -t wt-books -t "a2a.lt:32000/wt-books" .
podman push "a2a.lt:32000/wt-books"