# global describe, beforeEach, assert, it
"use strict"

describe 'Test Model', ->
  beforeEach ->
    @Test = new webappTemplate.Models.TestModel();
