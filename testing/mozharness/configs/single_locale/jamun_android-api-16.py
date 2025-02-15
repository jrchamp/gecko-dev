import os

BRANCH = "jamun"
MOZILLA_DIR = BRANCH

config = {
    "branch": BRANCH,
    "log_name": "single_locale",
    "objdir": "obj-firefox",
    "is_automation": True,
    "locales_dir": "mobile/android/locales",
    "ignore_locales": ["en-US"],
    "nightly_build": True,
    "tooltool_config": {
        "manifest": "mobile/android/config/tooltool-manifests/android/releng.manifest",
        "output_dir": "%(abs_work_dir)s/" + MOZILLA_DIR,
    },
    "hg_l10n_base": "https://hg.mozilla.org/l10n-central",
    "hg_l10n_tag": "default",
    'vcs_share_base': "/builds/hg-shared",

    "l10n_dir": "mozilla-beta",
    "repack_env": {
        # so ugly, bug 951238
        "LD_LIBRARY_PATH": "/lib:/tools/gcc-4.7.2-0moz1/lib:/tools/gcc-4.7.2-0moz1/lib64",
        "MOZ_OBJDIR": "obj-firefox",
        "EN_US_BINARY_URL": os.environ["EN_US_BINARY_URL"],
        "MOZ_UPDATE_CHANNEL": "nightly-jamun",
    },

    # Balrog
    "build_target": "Android_arm-eabi-gcc3",
}
