from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import argparse
import os


class StaticHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Chạy frontend Phong Vũ local.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--dir", default=os.path.dirname(os.path.abspath(__file__)))
    args = parser.parse_args()

    handler = partial(StaticHandler, directory=args.dir)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Đang chạy trang tại http://{args.host}:{args.port}")
    print("Nhấn Ctrl+C để dừng server.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
