from flask import Flask, request, redirect, url_for, render_template_string, flash
import requests
import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"pdf", "docx"}
BACKEND_UPLOAD_URL = os.environ.get("BACKEND_UPLOAD_URL", "http://localhost:5001/upload")

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "replace-with-a-secure-key")

HTML_PAGE = """
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <title>Upload via website</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; }
      .container { max-width: 680px; margin: auto; }
      .card { border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; background: #f9f9f9; }
      .message { margin: 0.5rem 0; }
      .message.error { color: #c00; }
      .message.success { color: #080; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Website Uploadformulier</h1>
      <div class="card">
        <p>Dit formulier stuurt het bestand naar een andere server voor opslag.</p>
        {% with messages = get_flashed_messages(with_categories=true) %}
          {% if messages %}
            <div class="messages">
              {% for category, message in messages %}
                <p class="message {{ category }}">{{ message }}</p>
              {% endfor %}
            </div>
          {% endif %}
        {% endwith %}
        <form method="post" action="{{ url_for('upload_file') }}" enctype="multipart/form-data">
          <input type="file" name="file" accept=".pdf,.docx" required>
          <button type="submit">Uploaden</button>
        </form>
      </div>
    </div>
  </body>
</html>
"""


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET"])
def index():
    return render_template_string(HTML_PAGE)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        flash("Geen bestand ontvangen.", "error")
        return redirect(url_for("index"))

    file = request.files["file"]
    if file.filename == "":
        flash("Geen bestand geselecteerd.", "error")
        return redirect(url_for("index"))

    if not allowed_file(file.filename):
        flash("Alleen .pdf en .docx bestanden zijn toegestaan.", "error")
        return redirect(url_for("index"))

    filename = secure_filename(file.filename)
    try:
        response = requests.post(
            BACKEND_UPLOAD_URL,
            files={"file": (filename, file.stream, file.mimetype)},
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        flash(data.get("message", f"Bestand '{filename}' succesvol geüpload."), "success")
    except requests.RequestException as exc:
        flash(f"Fout bij uploaden naar backend: {exc}", "error")
    except ValueError:
        flash("Backend gaf een ongeldige reactie terug.", "error")

    return redirect(url_for("index"))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
