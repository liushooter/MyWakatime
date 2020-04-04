const dateFormat = require('dateformat');

const WakaTimeClient = require('wakatime-client').WakaTimeClient;
const SteinStore = require("stein-js-client");

const steinhqApi = ""
const wakaTimeApiKey = ""
const uid = ""
const repo = ""

const client = new WakaTimeClient(wakaTimeApiKey);

async function getMetadata() {
  const metadata = await client.getMetadata();
  console.log(metadata)
}

async function getMe() {
  const myUserDetails = await client.getMe();
  console.log(myUserDetails);
}

async function getMyTeams() {
  const myTeams = await client.getMyTeams();
  console.log(myTeams);
}

async function getProjects() {
  const projects = await client.getProjects(uid);
  console.log(projects);
}


async function getDurations() {
  const _now = new Date();

  const now = dateFormat(_now, "yyyy-mm-dd");

  const durations = await client.getDurations({
    userId: uid,
    date: now,
    projectName: repo,
    // branchNames: [],
  });

  console.log(durations)
}


async function getMyDurations() { // 403
  const _now = new Date();

  const now = dateFormat(_now, "yyyy-mm-dd");

  const myDurations = await client.getMyDurations({
    date: now
  });

  console.log(myDurations)
}

async function getMyCommits() { // 跟github关联

  const commits = await client.getMyCommits({
    projectName: repo,
    authorName: uid,
  });

  console.log(commits)
}

async function getMySummary() {

  const _now = new Date();
  const now = dateFormat(_now, "yyyy-mm-dd")
  const _yesterday = new Date(_now.getTime() - (24 * 60 * 60 * 1000));
  const yesterday = dateFormat(_yesterday, "yyyy-mm-dd");

  const summary = await client.getMySummary({
    dateRange: {
      startDate: yesterday,
      endDate: now,
    },
    projectName: repo,
    // branchNames: [],
  })

  return summary

}


async function getMyTodayWorkTime() {
  const _now = new Date()

  const now = dateFormat(_now, "yyyy-mm-dd")
  const fulldatatime = dateFormat(_now, "yyyy-mm-dd HH:MM:ss")

  const summary = await getMySummary()

  const branches = summary["data"][1]["branches"]

  let total_seconds = 0

  for (const br of branches) {
    total_seconds += br['total_seconds']
  }

  const xhour = Math.floor(total_seconds / 3600)
  const xsec = Math.floor(total_seconds % 60)
  const xmin = Math.floor((total_seconds - xhour * 3600 - xsec) / 60)

  const info = `${now} 工作时间：${xhour}小时 ${xmin}分钟 ${xsec + 1}秒`

  console.log(`${info}，共计${total_seconds} 秒`)

  const store = new SteinStore(steinhqApi);
  store.append("work", [{
      worktime: fulldatatime,
      durations: info,
      total_seconds: total_seconds,
    }, ])
    .then(res => {
      console.log(res);
    });

}

getMyTodayWorkTime()
