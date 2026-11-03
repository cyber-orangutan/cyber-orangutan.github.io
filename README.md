# Ziad Alamri portfolio

Personal portfolio in a Windows XP and Frutiger Aero style. It is plain HTML, CSS and JavaScript, with no build step. The windows and buttons use [XP.css](https://github.com/botoxparty/XP.css) (MIT licence, see `assets/css/XP.css-LICENSE.txt`).

Live site: https://cyber-orangutan.github.io

## Publish it for the first time

1. Open GitHub Desktop and choose **File > New repository**.
2. Set the name to exactly `cyber-orangutan.github.io` and choose **Create repository**.
3. Open that new folder and copy every file from this portfolio into it, including `.nojekyll`.
4. In GitHub Desktop, write a summary such as `First version` and choose **Commit to main**.
5. Choose **Publish repository** and untick **Keep this code private**.
6. On github.com, open the repository and go to **Settings > Pages**.
7. Under **Build and deployment**, set the source to **Deploy from a branch**, then choose `main` and `/ (root)`, and save.
8. Wait a few minutes, then open https://cyber-orangutan.github.io

## Update the site

Change a file, then in GitHub Desktop choose **Commit to main** and **Push origin**. The site updates within a few minutes.

To preview on your computer, open the folder in VS Code, right-click `index.html` and choose **Open with Live Server**. Opening `index.html` by double-clicking will not load the content.

## Where everything is

| To change | Edit |
|---|---|
| Name, title, summary, email, LinkedIn | `data/site.json` |
| Show or hide a section | `sections` in `data/site.json` |
| Jobs | `data/experience.json` |
| Certificates | `data/certificates.json` |
| Skills | `data/skills.json` |
| Education and bootcamps | `data/education.json` |
| Projects | `data/projects.json` |
| YouTube videos | `data/videos.json` |
| CV download | replace `assets/cv/Ziad-Alamri-CV.pdf` |

## Show projects or YouTube

In `data/site.json`, change `"projects": false` or `"videos": false` to `true`.

Your CV projects are already in `data/projects.json`. To add a project, copy one block and change the text.

To add a video, put it in the list in `data/videos.json`. The ID is the part after `v=` in the YouTube link:

```json
{
  "channel": "https://www.youtube.com/@cyberorangutan",
  "videos": [
    {
      "title": "Video title",
      "youtubeId": "VIDEO_ID",
      "description": "One short sentence about the video."
    }
  ]
}
```

## Keep private details out

Everything in this repository is public, including sections that are switched off.

- Do not upload `step.pdf`, because it shows your national ID number.
- `assets/cv/Ziad-Alamri-CV.pdf` is your full CV and includes your phone number, so anyone can see that number if they download it.
