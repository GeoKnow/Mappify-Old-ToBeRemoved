#!/bin/bash

html_snippet=''
for i in *png; do html_snippet=$html_snippet"<li>"$i"</li>"; done
echo $html_snippet;
