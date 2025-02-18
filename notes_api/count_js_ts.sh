#!/bin/bash
git ls-files "*.[j|t]s" | tr '\n' '\0' | xargs -0 wc -l | awk 'END {print $1}'
