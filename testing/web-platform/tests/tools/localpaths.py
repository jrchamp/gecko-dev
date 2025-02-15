import os
import sys

here = os.path.abspath(os.path.split(__file__)[0])
repo_root = os.path.abspath(os.path.join(here, os.pardir))

sys.path.insert(0, os.path.join(here))
sys.path.insert(0, os.path.join(here, "wptserve"))
sys.path.insert(0, os.path.join(here, "pywebsocket"))
sys.path.insert(0, os.path.join(here, "third_party", "atomicwrites"))
sys.path.insert(0, os.path.join(here, "third_party", "attrs", "src"))
sys.path.insert(0, os.path.join(here, "third_party", "funcsigs"))
sys.path.insert(0, os.path.join(here, "third_party", "html5lib"))
sys.path.insert(0, os.path.join(here, "third_party", "more-itertools"))
sys.path.insert(0, os.path.join(here, "third_party", "pluggy"))
sys.path.insert(0, os.path.join(here, "third_party", "py"))
sys.path.insert(0, os.path.join(here, "third_party", "pytest", "src"))
sys.path.insert(0, os.path.join(here, "third_party", "six"))
sys.path.insert(0, os.path.join(here, "third_party", "webencodings"))
sys.path.insert(0, os.path.join(here, "webdriver"))
sys.path.insert(0, os.path.join(here, "wptrunner"))
