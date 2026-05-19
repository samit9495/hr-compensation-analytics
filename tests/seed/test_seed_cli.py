import subprocess
import sys
from pathlib import Path


def test_seed_cli_help_lists_required_flags() -> None:
    result = subprocess.run(
        [sys.executable, "-m", "scripts.seed", "--help"],
        capture_output=True,
        text=True,
        cwd=str(Path(__file__).resolve().parents[2]),
    )

    assert result.returncode == 0, result.stderr
    out = result.stdout
    assert "--count" in out
    assert "--seed" in out
    assert "--reset" in out
