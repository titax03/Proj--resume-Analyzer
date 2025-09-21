async function analyzeResume() {
      const fileInput = document.getElementById('resumeFile');
      if (!fileInput.files[0]) {
        alert("Please upload a PDF resume");
        return;
      }

      const formData = new FormData();
      formData.append("resume", fileInput.files[0]);

      document.getElementById("result").innerText = "Analyzing resume... ⏳";

      try {
        const res = await fetch("http://localhost:5000/analyze", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        document.getElementById("result").innerText = data.analysis;
      } catch (err) {
        document.getElementById("result").innerText = "Error analyzing resume.";
      }
    }





    function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");

  document.querySelector(".container").classList.toggle("dark");
  document.querySelector(".container").classList.toggle("light");

  document.getElementById("result").classList.toggle("dark");
}
