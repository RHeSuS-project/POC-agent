/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function logStatus(status)
{
    /*var parentElement = document.getElementById('hrm');
        var listeningElement = parentElement.querySelector('.listening');

        listeningElement.innerHTML+=status+'<br/>';*/
    console.log(status);
}

function dump(obj) {
    logStatus(JSON.parse(JSON.stringify(obj)));
}

function loadPlugin(name){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '../plugin/'+name+'/js/'+name+'.js';
    script.onreadystatechange = name+'.initialize();';
    script.onload = name+'.construct();';
    head.appendChild(script);
}