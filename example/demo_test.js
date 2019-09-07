Feature('GitHub');

Scenario('Demo Test', (I) => {
  I.amOnPage('https://github.com');
  I.see('GitHub');
});

Scenario('Demo Test 2', (I) => {
  I.amOnPage('https://gitlab.com');
  I.dontSee('GitHub');
  I.see('GitLab');
});

