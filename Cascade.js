/* 
 
-Copyright (c) 2012 Josselin Chevalay, http://josselinchevalay.wordpress.com 
-
-Permission is hereby granted, free of charge, to any person obtaining
-a copy of this software and associated documentation files (the
-"Software"), to deal in the Software without restriction, including
-without limitation the rights to use, copy, modify, merge, publish,
-distribute, sublicense, and/or sell copies of the Software, and to
-permit persons to whom the Software is furnished to do so, subject to
-the following conditions:
-
-The above copyright notice and this permission notice shall be
-included in all copies or substantial portions of the Software.
-
-THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
-EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
-MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
-NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
-LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
-OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
-WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-
-
 */
Attribut = function (id, value)
          {
              this.Id = id;
              this.Value = value;
              
            };
            EntitiesCas = function(name,attributs,type)
           {
                this.Name = name;
                this.Attributs = attributs;
                this.Type = type;
               
            }
            function getElementsByClass(className) { // permet de recuperer un tableau d'élements
            var arr = new Array();
            var elems = document.getElementsByTagName("*" );
            for(var i = 0; i < elems.length; i++) {
                var elem = elems[i];                
                var cls = elem.className;// normalement on devrait mettre elem.getAttribute("class" ); mais IE supporte pas
                if(cls == className) {
                arr[arr.length] = elem;
                }
            }
            return arr;
            }
            function baliseInjection(entity) // gère l'injection pour les balises
            {
                var tabTag = document.all.tags(entity.Name);
                var attrs = entity.Attributs;
                for(var i=0;i<tabTag.length;i++)
                    {
                        for(var j=0;j<attrs.length;j++)
                            {
                                tabTag[i].setAttribute(attrs[j].Id, attrs[j].Value);
                            }
                    }
            }
            function classInjection(entity) // gère l'injection pour les classes
            {
                var tabClass=getElementsByClass(entity.Name);
                var attrs = entity.Attributs;
                for(var i=0;i<tabClass.length;i++)
                    {
                        for(var j=0;j<attrs.length;j++)
                            {
                                tabClass[i].setAttribute(attrs[j].Id, attrs[j].Value);
                            }
                    }
            }
            function idInjection(entity) // gère l'injection pour les identifiants
            {
               
                var attrs = entity.Attributs;
                for(var j=0;j<attrs.length;j++)
                {
                    document.getElementById(entity.Name).setAttribute(attrs[j].Id, attrs[j].Value);
                } 
            }
            function CasInjector(tabEntityCas)
            {
                
                for(var i=0;i<tabEntityCas.length;i++)
                {     
                    
                    if(tabEntityCas[i].Type=="id")
                        {
                            idInjection(tabEntityCas[i]);
                        }
                        else if (tabEntityCas[i].Type=="balise")
                            {
                                baliseInjection(tabEntityCas[i]);
                            }
                            else if(tabEntityCas[i].Type=="class")
                                {
                                    classInjection(tabEntityCas[i]);
                                }
                }             
        
            }
            function trim(str)
            {
               chaine = "";
               for(var i= 0; i<str.length;i++)
                   {
                       if(str.charCodeAt(i)==10)
                           {                               
                               chaine = chaine + "";
                           }
                           else
                           {
                                chaine = chaine + str.substring(i, i+1);
                           }
                   }
               return chaine.replace(/ /g,"");
               
            }
            function strBefore(str, str2)
            {
                return str.substring(0, str.indexOf(str2, str));
            }
            function getType(str) // retourne le type EntityCas
            {
                if(str.match(/^\./))
                    {return "class";}
                else if(str.match(/^#/))
                    {return "id";}
                else if (str.match(/^[a-z]|[A-Z]/))
                    {return "balise";}
                     
            }
            function getName(str) // Retourne le nom de l'entitycas
            {
                if(getType(str)=="id")
                    {return str.substring(1, str.length);}
                else if (getType(str)=="class")
                {return str.substring(1, str.length);}
                else if (getType(str)=="balise")
                    {return str;}
            }
            // parser debuggé reste plus qu'a mettre dans objet ^^ 
            // je tiens a remercier Charly lesieur pour ça contribution 
            // sur le parser
            // Bug -> Values dois être parser 
            function Parser(contenu) // parse la balise cas
            {           
                
               var chaine = contenu.innerHTML;
               chaine = trim(chaine); 
               var tabEntityCas = Array();
               while (chaine.length>=1)
               {
                var end = false; 
                var tempType = getType(strBefore(chaine, "{"));
                var tempName = getName(strBefore(chaine, "{"));             
                chaine = chaine.substring(chaine.indexOf("{", chaine)+1, chaine.length);
                var tempAttributs = Array();
                     while(!end)
                      {
                         var tempId = strBefore(chaine, ":");                         
                         chaine = chaine.substring(chaine.indexOf(":", chaine)+1, chaine.length);
                         var tempValue= strBefore(chaine, "§");
                         chaine = chaine.substring(chaine.indexOf("§", chaine)+1, chaine.length);
                         var tempAttribut = new Attribut(tempId, tempValue);
                         tempAttributs.push(tempAttribut);
                         var x = chaine.charAt(0); 
                             if(x=='}')
                             {
                                 end = true;                                  
                             }                            
                       }
                       
                       chaine = chaine.substring(chaine.indexOf("}", chaine)+1, chaine.length);
                       //alert(chaine);
                      // alert(chaine.length);
                      var tempEntityCas = new EntitiesCas(tempName, tempAttributs, tempType);
                      tabEntityCas.push(tempEntityCas);
                }    
                         
                
                return tabEntityCas;
            }
            function getContenu(balise) // fonction qui recupere les contenu des balises
            {
               
               if(balise.getAttribute('type')=="text/cas")
               {
                   if(balise.innerHTML!="")
                   {
                    var object = Parser(balise);
                    CasInjector(object); 
                   }                                                    
               }
            }
            function onListen() // function qui recupere les balise script
            {
              var listBalises =  document.getElementsByTagName('script');             
                for(var i=0; i<listBalises.length; i++){                       
                        getContenu(listBalises[i]);
                }
            } 
            
            
       
             

