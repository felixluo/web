#! /bin/sh

find ./ ! -name "pub.sh" -exec grep "felix" '{}' \; -exec sed -i.bak "s/felix/pub/g" '{}' \;
