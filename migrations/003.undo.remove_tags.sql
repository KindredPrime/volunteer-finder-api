DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  tag_name TEXT NOT NULL
);

CREATE TABLE org_tags (
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (org_id, tag_id)
);