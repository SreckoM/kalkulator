Categories
A. Product: 1.Prozor   2.Balkon   3.Podizno/Klizni
B. Type: A1 A2 A3 1.Jednokrilni A1 A2 A3 2.Dvokrilni A1 4.Trokrilni
C. Material: A1 A2 1.PVC   A1 A2 A3 2.ALU
D. Profile: A1 A2. 1.Basic   2.Standard   3.Optimal   4.Premium   A3. 1.Alumil termo 2. Alumil hladni  3.Asistal termo 4. Asistal hladni.
E. Additions: Komarnik Roletna Okapnica Pod-prozorska-daska
F. Input dimensions

Prices and factors will be hidden on front hand.
Need simple backend where I can change pictures for profiles, prices and multiplication factors. Save that as JSON file for now.

Multiplication factors
1. Prozor factor is 1
2. Balkon factor is 1
3. Podizno/Klizni factor is 1.2
4. Jendokrilni factor is 1, Dvokrilni factor is 1.05, Trokrilni factor is 1.15
5. Materials: PVC price is 1.5 euro per square cm, ALU price is 2.2 euro per square cm
6. Profiles  Basic factor is 1, Standard factor is 1.1, Optimal factor is 1.2, Premium factor is 1.4. Alumil factor is 1.4
7. Komarnik price is formed by width x height mulripled by price, lets for now make it 1.1.  Roletna price is same way of forming as okpanica,and let it be  1.4. Okapanica is width multiplied by price, make it 1.2 and Pod-prozorska-daska is same as okpanice, just price is 1.1. 
8. Dimensions will be width x height in mm, and price is going to be 1.5euro per square cm for PVC material and 2.2 for ALU material.

Rules
1. Type, can be Jednokrilni and Dvokrilni for Prozor, Balkon and Podizno/Klizni products. Dvokrilni sa stubom  and Trokrilni for Prozor product only.                     
2. Materials can be PVC for Prozor and Balkon product. ALU for all products, Prozor, Balkon and Podizno/Klizni product.
3. Profiles, Basic, Standard, Optimal and Premium are for Prozor and Balkon products, and Alumil is for Podizno/Klizni product. 
4. Komarnik and Roletne are additions for all products.

So price formula is: material-price x width x height x Product factor x Type factor x Profile factor + Komarnik + Roletne + Okpanica + Pod-prozorska-daska
